#!/usr/bin/env python3
"""
ask_turbine_bot.py

End-to-end:
  • Slot-fill with OpenRouter DeepSeek (with retries + longer timeout)
  • Call local FastAPI /predict_fault
  • Print out the result
"""
import os
import certifi
import json
import requests
import re
from requests.adapters import HTTPAdapter, Retry
from requests.exceptions import HTTPError, ConnectionError

from shap_formatter import prepare_shap_for_prompt
from get_errors_logs_summary import get_error_summary_for
from prompt_generator import generate_deepseek_prompt
from deepseek_client import query_deepseek

# ─── SSL CERT FIX (must come before any network calls) ─────────────────────────
os.environ["SSL_CERT_FILE"]      = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

# ─── CONFIG ────────────────────────────────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise RuntimeError(
        "🔑 Please set OPENROUTER_API_KEY in your environment before running.\n"
        "   In PowerShell: $Env:OPENROUTER_API_KEY = 'sk-...'\n"
        "   In CMD:       set OPENROUTER_API_KEY=sk-..."
    )

DEEPSEEK_URL     = "https://openrouter.ai/api/v1/chat/completions"
DEEPSEEK_MODEL   = "deepseek/deepseek-chat"
LOCAL_PREDICT_URL = "http://localhost:8000/predict_fault"

# ─── SESSION WITH RETRIES ──────────────────────────────────────────────────────
session = requests.Session()
retries = Retry(
    total=3,
    backoff_factor=1,                  # waits: 1s, 2s, 4s
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["POST"]
)
adapter = HTTPAdapter(max_retries=retries)
session.mount("https://", adapter)

def parse_with_deepseek(user_query: str) -> dict:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type":  "application/json",
        "Accept":        "application/json",
    }
    system_prompt = (
        "You are a slot‐filling assistant. "
        "Parse the user's question and return ONLY a JSON object "
        "with keys: intent, turbine_id, and optionally log_date (ISO YYYY-MM-DD). "
        "DO NOT wrap your JSON in markdown or add any commentary."
    )
    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": [
            {"role": "system",  "content": system_prompt},
            {"role": "user",    "content": user_query},
        ]
    }

    resp = session.post(DEEPSEEK_URL, json=payload, headers=headers, timeout=30)
    resp.raise_for_status()
    body = resp.json()

    # 1) get raw reply text
    try:
        content = body["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise RuntimeError(f"Unexpected completion format: {body!r}")
    
    print("📦 Raw DeepSeek response:\n", content)  # 👈 for debugging

    # 2) strip markdown fences if present
    #    it will remove json ... or ...

    fence_match = re.match(r"^```(?:json)?\s*([\s\S]*?)\s*```$", content.strip())
    if fence_match:
        content = fence_match.group(1)

    # 3) ensure non-empty
    if not content.strip():
        raise RuntimeError("DeepSeek reply was empty after stripping fences.")

    # 4) parse JSON
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Invalid JSON from DeepSeek: {e}\n--- Raw content ---\n{content}")

def call_local_predict(parsed: dict) -> dict:
    """
    Given parsed slots, POST to /predict_fault and return JSON reply.
    """
    payload = {"turbine_id": parsed["turbine_id"]}
    if parsed.get("log_date"):
        payload["log_date"] = parsed["log_date"]

    try:
        resp = session.post(LOCAL_PREDICT_URL, json=payload, timeout=5)
        resp.raise_for_status()
    except ConnectionError:
        raise RuntimeError(f"Could not connect to {LOCAL_PREDICT_URL}")
    except HTTPError:
        # <-- catch the 422 and show the body
        print("❌ Prediction service responded with:", resp.status_code, resp.text)
        raise RuntimeError("Prediction request failed validation.")
    return resp.json()

def generate_answer_with_deepseek(user_query: str, model_response: dict) -> str:
    turbine_id = model_response.get("turbine_id", "Unknown")
    date = model_response.get("log_date", "Unknown")
    probability = round(model_response.get("fault_probability", 0.0) * 100, 2)

    explanations = model_response.get("explanations", [])
    top_factors = "\n".join([
        f"- {e['feature']} (SHAP value: {e['shap_value']:+.4f})"
        for e in explanations
    ]) or "No strong influencing factors found."

    prompt = f"""
    ### Fault Risk Explanation for Turbine {turbine_id} on {date}

    - Predicted Fault Risk: **{probability}%**

    #### Top Contributing Factors:
    {top_factors}

    Please explain why this turbine is at risk using simple language and suggest what the operator should check.
    """

    return query_deepseek(prompt, os.getenv("OPENROUTER_API_KEY"))


# ─── FINAL CHATBOT REPLY ────────────────────────────────────
def ask_turbine_bot(user_query: str):
    print(f"\n🔍 Query: {user_query!r}")
    parsed = parse_with_deepseek(user_query)
    print("✅ Parsed:", parsed)

    prediction = call_local_predict(parsed)
    print("🤖 Prediction:", prediction)

    # SHAP explanation formatting
    shap_text = prepare_shap_for_prompt(prediction["explanations"])

    # Error log formatting
    turbine_id = parsed["turbine_id"]
    log_date = parsed.get("log_date")
    error_summary = get_error_summary_for(turbine_id, log_date)

    # Final prompt to DeepSeek
    full_prompt = generate_deepseek_prompt(user_query, shap_text, error_summary)
    print("\n📨 Sending to DeepSeek...\n")
    answer = query_deepseek(full_prompt, OPENROUTER_API_KEY)

    print("\n💬 Answer:\n", answer)

# ─── ENTRY POINT ─────────────────────────────────────────────
if __name__ == "__main__":
    question = input("🔍 Enter your turbine-risk question: ").strip()
    if not question:
        print("No question provided.")
    else:
        ask_turbine_bot(question)