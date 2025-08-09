import os
import pandas as pd
from sqlalchemy import text
from dotenv import load_dotenv
from sqlalchemy import create_engine

# Load DB credentials
load_dotenv()
DB_URL = os.getenv("DATABASE_URL", "postgresql://wind_user:windy@localhost:5432/wind_db")
engine = create_engine(DB_URL)

def get_error_summary_for(turbine_id: str, log_date: str) -> str:
    """
    Fetches and summarizes error logs for the given turbine and date.
    Returns a text summary for chatbot context.
    """
    query = text("""
        SELECT "short_description", "duration"
        FROM error_logs
        WHERE "turbine_id" = :turbine_id
          AND DATE("error_time") = :log_date
        ORDER BY "error_time" ASC
        LIMIT 5
    """)
    
    df = pd.read_sql_query(query, engine, params={
        "turbine_id": turbine_id,
        "log_date": log_date
    })

    if df.empty:
        return "No operational errors were recorded on this day for this turbine."

    summary_lines = []
    for _, row in df.iterrows():
        duration = row["duration"]
        desc = row["short_description"]
        summary_lines.append(f"• {desc} (Duration: {duration})")

    return "\n".join(summary_lines)




