import os
import shap
import xgboost as xgb
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_URL = os.getenv("DATABASE_URL", "postgresql://wind_user:windy@localhost:5432/wind_db")

# Connect to Postgres
engine = create_engine(DB_URL)

# Columns used by the model (make sure they match what model expects)
feature_cols = [
    'gen_units', 'operating_hrs', 'avg_wind_speed', 'lull_hrs', 'fault_time',
    'pm_shut_down', 'int_grid_down', 'ext_grid_down', 'capacity',
    'downtime_hrs', 'availability', 'plf_percent', 'mttr', 'mtbf'
]

def get_features_for(turbine_id: str, log_date: str) -> pd.DataFrame:
    query = text(f"""
        SELECT {", ".join(feature_cols)}
        FROM wtg_features
        WHERE turbine_id = :turbine_id AND log_date = :log_date
        LIMIT 1
    """)
    df = pd.read_sql_query(query, engine, params={
        "turbine_id": turbine_id,
        "log_date": log_date
    })

    if df.empty:
        raise ValueError(f"No data found for turbine {turbine_id} on {log_date}")
    return df

def explain_shap(turbine_id: str, log_date: str) -> list:
    # Load data for the specific turbine and date
    X = get_features_for(turbine_id, log_date)

    # Load the trained XGBoost model
    model_path = os.path.join("models", "xgb_fault_classifier_final.json")
    model = xgb.Booster()
    model.load_model(model_path)

    # Compute SHAP values
    explainer = shap.TreeExplainer(model, feature_perturbation="tree_path_dependent")
    shap_exp = explainer(X)

    values = shap_exp.values[0]  # explanation for the first (only) row

    # Format for chatbot
    explanation = []
    for i, feature in enumerate(feature_cols):
        explanation.append({
            "feature": feature,
            "value": float(X.iloc[0][feature]),
            "shap_value": float(values[i])
        })
    return explanation

# Optional test
if __name__ == "__main__":
    turbine_id = input("Enter Turbine ID (e.g., LH-003): ").strip()
    log_date = input("Enter Log Date (YYYY-MM-DD): ").strip()

    result = explain_shap(turbine_id, log_date)
    print("✅ SHAP Explanation for chatbot prompt:")
    for row in result:
        sign = "+" if row['shap_value'] >= 0 else "-"
        print(f"{row['feature']}: {sign}{abs(row['shap_value']):.4f}")
