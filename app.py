import pandas as pd
import xgboost as xgb
import shap
from sqlalchemy import create_engine
from fastapi import HTTPException
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from ask_turbine_bot import (
    parse_with_deepseek,
    call_local_predict,
    generate_deepseek_prompt,
    query_deepseek,
)
from shap_formatter import prepare_shap_for_prompt
from get_errors_logs_summary import get_error_summary_for
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from db import SessionLocal, engine
from models import ChatMessage, User
from sqlalchemy import text
from fastapi import Depends
from dependencies import get_current_user
from models import Base
Base.metadata.create_all(bind=engine)


# Initialize FastAPI app
app = FastAPI(title="Wind Turbine Fault Prediction API")
from routes.auth import auth_router

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] during local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
    explanations: List[Dict[str, Any]]

# Load environment variables / connection string
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://wind_user:windy@localhost:5432/wind_db"
)
engine = create_engine(DATABASE_URL)

# Load fault classification model
fault_model = xgb.Booster()
fault_model.load_model("models/xgb_fault_classifier_final.json")

# Initialize SHAP explainer for the fault model (CPU-only)
os.environ["FORCE_CPU"] = "1"
fault_explainer = shap.TreeExplainer(fault_model, feature_perturbation="tree_path_dependent")

# Pydantic schemas
class FeatureContribution(BaseModel):
    feature: str
    shap_value: float

class PredictFaultRequest(BaseModel):
    turbine_id: str
    log_date: Optional[str] = None  # YYYY-MM-DD

class PredictFaultResponse(BaseModel):
    turbine_id: str
    log_date: str
    fault_probability: float
    explanations: List[FeatureContribution]

# Helper to fetch feature row from DB
def fetch_feature_row(turbine_id: str, log_date: Optional[str]):
    if log_date:
        query = f"""
            SELECT * FROM wtg_features
            WHERE turbine_id = '{turbine_id}'
              AND log_date = '{log_date}'
            LIMIT 1;
        """
    else:
        query = f"""
            SELECT * FROM wtg_features
            WHERE turbine_id = '{turbine_id}'
            ORDER BY log_date DESC
            LIMIT 1;
        """
    df = pd.read_sql_query(query, engine)
    if df.empty:
        raise HTTPException(status_code=404, detail="No data for given turbine/date")
    return df

def save_chat_to_db(user_msg: str, bot_msg: str, intent: str = None):
    db = SessionLocal()
    try:
        chat_entry = ChatMessage(
            user_message=user_msg,
            bot_response=bot_msg,
            intent=intent
        )
        db.add(chat_entry)
        db.commit()
    finally:
        db.close()

@app.get("/test-db")
def test_db():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))  # test query
        db.close()
        return {"status": "✅ Database connection successful"}
    except Exception as e:
        return {"status": "❌ DB connection failed", "error": str(e)}


# Endpoint: predict fault probability
@app.post("/predict_fault", response_model=PredictFaultResponse)
def predict_fault(req: PredictFaultRequest):
    df = fetch_feature_row(req.turbine_id, req.log_date)
    
    # Drop everything that isn't a numeric feature
    drop_cols = {
        "dgr_id_no", "log_date", "turbine_id", "will_fault_occur",
        "nor_1", "nor_2", "remarks"
    }
    X = df.drop(columns=[c for c in drop_cols if c in df.columns])

    # Now X contains only int/float columns, safe for DMatrix
    dmat = xgb.DMatrix(X)

    prob = float(fault_model.predict(dmat)[0])

    # SHAP explanation
    shap_vals = fault_explainer(X).values[0]
    contribs = sorted(
        zip(X.columns, shap_vals),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:3]

    explanations = [
        FeatureContribution(feature=f, shap_value=v)
        for f, v in contribs
    ]
    return PredictFaultResponse(
        turbine_id=req.turbine_id,
        log_date=str(df["log_date"].iloc[0].date()),
        fault_probability=prob,
        explanations=explanations
    )


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    try:
        # 1) Parse question
        parsed = parse_with_deepseek(req.question)

        # 2) Prepare input for model
        predict_req = PredictFaultRequest(**{
            "turbine_id": parsed["turbine_id"],
            "log_date":   parsed.get("log_date")
        })

        # 3) Model prediction
        model_response = call_local_predict(parsed)
        
        # Step 3: Prepare SHAP explanation
        shap_text = prepare_shap_for_prompt(model_response["explanations"])

        # Step 4: Get error log summary
        turbine_id = parsed["turbine_id"]
        log_date = parsed.get("log_date")
        error_summary = get_error_summary_for(turbine_id, log_date)

        # Step 5: Combine all into a DeepSeek prompt
        full_prompt = generate_deepseek_prompt(req.question, shap_text, error_summary)

        # Step 6: Get final explanation from DeepSeek
        answer = query_deepseek(full_prompt, os.getenv("OPENROUTER_API_KEY"))

        print("📥 Attempting to save chat to DB...")
        print("🧠 User Message:", req.question)
        print("🤖 Bot Response:", answer)
        print("🎯 Intent:", parsed.get("intent", "unknown"))
        # ✅ Step 7: Save to database
        db = SessionLocal()  # ⬅️
        try:
            db_chat = ChatMessage(  # ⬅️
                user_id=current_user.id,
                user_message=req.question,
                bot_response=answer,
                intent=parsed.get("intent", "unknown")
            )
            db.add(db_chat)
            db.commit()
            print("✅ Chat saved successfully.")
        except Exception as e:
            print("❌ Error while saving chat:", e)
        finally:
            db.close()

        # Final response
        return AskResponse(
            answer=answer,
            explanations=model_response["explanations"]
        )

    except Exception as e:
        print(f"Error in /ask: {e}")
        return JSONResponse(
            status_code=200,
            content={
                "answer": f"⚠️ Unable to process your request due to: {str(e)}",
                "explanations": []
            }
        )
    
@app.get("/my-chats")
def get_user_chats(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        chats = db.query(ChatMessage)\
                  .filter(ChatMessage.user_id == current_user.id)\
                  .order_by(ChatMessage.created_at.desc())\
                  .all()

        return [{
            "question": c.user_message,
            "answer": c.bot_response,
            "intent": c.intent,
            "created_at": c.created_at
        } for c in chats]

    finally:
        db.close()

    