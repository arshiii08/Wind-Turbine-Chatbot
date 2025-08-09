# streamlit_app.py
import streamlit as st
import requests

API_URL = "http://localhost:8000/ask"

st.set_page_config(page_title="Wind Turbine Fault Assistant")
st.title("🔍 Wind Turbine Fault Risk Assistant")
st.markdown("Ask a question like: `What is the fault risk of turbine LH-003 on 2025-03-25?`")

user_query = st.text_input("Your Question")

if st.button("Ask"):
    if not user_query.strip():
        st.warning("Please enter a question.")
    else:
        with st.spinner("Analyzing..."):
            try:
                resp = requests.post(API_URL, json={"question": user_query})
                resp.raise_for_status()
                data = resp.json()
                st.markdown("### Answer:")
                st.write(data["answer"])
            except requests.exceptions.RequestException as e:
                st.error(f"API request failed: {e}")
