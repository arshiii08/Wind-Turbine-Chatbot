def generate_deepseek_prompt(user_question, shap_text, error_log_summary):
    return f"""
You are a wind turbine fault analysis assistant.

A user asked:
"{user_question}"

Based on the model's prediction, the following factors contributed to the turbine's fault risk:
{shap_text}

In addition, these real-world error logs were recorded on the same date:
{error_log_summary}

Explain in natural language why the fault risk is elevated or low for this turbine on that date.
Use both model reasoning and operational evidence. Keep it clear for engineers and managers.
"""
