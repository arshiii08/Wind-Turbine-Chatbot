import pandas as pd
from sqlalchemy import create_engine

# --- Step 1: Setup database connection ---
DATABASE_URL = "postgresql://wind_user:windy@localhost:5432/wind_db"
engine = create_engine(DATABASE_URL)

# --- Step 2: Function to query error logs for a given turbine and date ---
def get_error_logs_for_day(turbine_id: str, log_date: str, engine) -> pd.DataFrame:
    query = f"""
    SELECT * FROM error_logs
    WHERE turbine_id = '{turbine_id}'
    AND DATE(error_time) = '{log_date}'
    ORDER BY error_time;
    """
    return pd.read_sql(query, engine)

# --- Step 3: Function to format logs into explanation-ready prompt ---
def format_error_logs_for_prompt(df: pd.DataFrame) -> str:
    if df.empty:
        return "No recorded errors for the turbine on this date."
    
    summary = []
    for _, row in df.iterrows():
        # Format error time to HH:MM (e.g., 02:30)
        error_time = pd.to_datetime(row["error_time"]).strftime("%H:%M")
        
        # Clean duration string (remove microseconds)
        duration = str(row["duration"]).split(".")[0]
        
        # Build sentence
        summary.append(
            f"At {error_time}, error #{row['alarm_code']} occurred: {row['short_description']} lasting {duration}."
        )
    
    return "\n".join(summary)

# --- Step 4: Get input from user and run ---
if __name__ == "__main__":
    turbine_id = input("Enter Turbine ID (e.g., LH-003): ").strip()
    log_date = input("Enter Log Date (YYYY-MM-DD): ").strip()

    try:
        df_logs = get_error_logs_for_day(turbine_id, log_date, engine)
        formatted_summary = format_error_logs_for_prompt(df_logs)

        print("\n✅ Error Summary:")
        print(formatted_summary)

    except Exception as e:
        print(f"❌ Error occurred: {e}")
