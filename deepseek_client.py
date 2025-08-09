import requests
import os
import json
from pprint import pformat


def query_deepseek(prompt: str, api_key: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost",  # or your project URL
        "X-Title": "WindTurbineChatbot",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek/deepseek-chat",  # ✅ correct model ID for OpenRouter
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that explains wind turbine faults."},
            {"role": "user", "content": prompt}
        ]
    }

    try:
        print("📦 Sending payload to OpenRouter...\n", json.dumps(payload, indent=2)[:1000])
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)

        print("✅ Status Code:", response.status_code)
        print("📥 Raw response:", response.text[:500])  # Limit output for readability

        response.raise_for_status()

        json_resp = response.json()
        return json_resp["choices"][0]["message"]["content"]

    except requests.exceptions.HTTPError as e:
        print("❌ HTTP error:", e)
        print("🔍 Response content:", response.text)
        raise
    except ValueError as e:
        print("❌ JSON decode error:", e)
        print("⚠️ Response content was not valid JSON:", response.text)
        raise


def generate_answer_with_deepseek(user_query: str, model_response: dict) -> str:
    # Safely extract and fallback for missing keys
    turbine_id = model_response.get("turbine_id", "Unknown")
    date = model_response.get("log_date", "Unknown")
    try:
        probability = round(float(model_response.get("fault_probability", 0.0)) * 100, 2)
    except (TypeError, ValueError):
        probability = 0.0

    explanations = model_response.get("explanations", [])
    if not isinstance(explanations, list):
        explanations = []

    # Build formatted SHAP output
    top_factors = "\n".join([
        f"- {e.get('feature', 'unknown')} (SHAP value: {e.get('shap_value', 'N/A'):+.4f})"
        for e in explanations if "feature" in e and "shap_value" in e
    ]) or "No strong influencing factors found."

    prompt = f"""
### Fault Risk Explanation for Turbine {turbine_id} on {date}

- Predicted Fault Risk: **{probability}%**

#### Top Contributing Factors:
{top_factors}

Please explain why this turbine might be at risk in simple language. Also suggest what the operator should check.
""".strip()

    print("🧠 Final prompt sent to DeepSeek:\n", prompt[:1000])  # Truncate for safety

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("❌ OPENROUTER_API_KEY not found in environment variables.")

    return query_deepseek(prompt, api_key)
