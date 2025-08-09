# 🌬️ Wind Turbine Fault Prediction & Chatbot

An **AI-powered chatbot** designed for **wind turbine SCADA data** analysis, enabling **real-time fault diagnosis**, **explainable AI insights**, and **data-driven recommendations** for operators.

---

## 📌 Overview

This project integrates:
- **XGBoost** for wind turbine fault prediction.
- **SHAP** for explainable AI (feature contribution insights).
- **DeepSeek API (via OpenRouter)** for natural language explanations.
- **PostgreSQL + SQLAlchemy** for structured data storage.
- **FastAPI** backend for prediction APIs.
- **React (TypeScript)** frontend with full chat interface, dark mode, and persistent history.
- **Authentication** system (login/signup) with password hashing (bcrypt).

The chatbot can:
- Predict fault risk for a given turbine and date.
- Explain the reasons in **simple terms** (non-technical) by converting SHAP values into human-friendly language.
- Reference **error log data** to provide more accurate explanations.
- Store chat history in the backend for future model learning.

---

## 🗂️ Project Structure

- `windturbine-chatbot/`
  - `backend/`
    - `app/`
      - `main.py` – FastAPI entrypoint
      - `models.py` – SQLAlchemy models
      - `database.py` – DB connection setup
      - `auth.py` – Login/Signup logic
      - `xgb_fault_classifier.py` – XGBoost model loading & prediction
      - `shap_explainer.py` – SHAP explainability utilities
      - `deepseek_client.py` – OpenRouter API wrapper
      - `get_error_logs_summary.py` – Error log summarization
      - `...`
    - `requirements.txt`
  - `frontend/`
    - `src/`
      - `App.tsx` – React entrypoint
      - `components/Sidebar.tsx`
      - `components/ChatArea.tsx`
      - `components/LoginModal.tsx`
      - `hooks/useLocalStorage.ts`
      - `...`
    - `package.json`
  - `README.md`
---

## 🚀 Features

### 🔮 Fault Prediction
- Uses a **trained XGBoost model** to predict turbine fault probability.
- Supports multiple KPIs and SCADA metrics.

### 🧠 Explainable AI
- SHAP-based contribution analysis.
- Converts technical SHAP values into **plain English insights** for operators.

### 💬 Natural Language Chatbot
- DeepSeek API for contextual, user-friendly fault explanations.
- Can answer queries like:  


### 📊 Data Management
- PostgreSQL database stores:
- Turbine metadata
- SCADA metrics
- Error logs
- Chat history

### 🔐 Authentication
- Login/signup system with **bcrypt** password hashing.
- Session-based authentication for secure chat access.

### 🌙 UI/UX
- Dark/light mode toggle.
- Fully responsive layout (desktop & mobile).
- Chat bubbles with avatars.
- Persistent chat history across sessions.
- Typing animation for bot responses.

---

## 📊 Tech Stack

**Backend**
- Python, FastAPI
- PostgreSQL + SQLAlchemy
- XGBoost, SHAP
- Pydantic (data validation)
- bcrypt (password hashing)
- OpenRouter API (DeepSeek)

**Frontend**
- React + TypeScript
- Tailwind CSS
- lucide-react icons

---

## 📡 API Endpoints

| Method | Endpoint         | Description               |
|--------|------------------|---------------------------|
| POST   | `/ask`           | Process chatbot query      |
| POST   | `/predict_fault` | Predict turbine fault      |
| POST   | `/auth/signup`   | User registration          |
| POST   | `/auth/login`    | User login                 |

---

## 🔮 Future Improvements

- Add **Retrieval-Augmented Generation (RAG)** for referencing static turbine documents.
- Enable **multi-language support**.
- Enhance dashboard for historical fault trend visualization.
