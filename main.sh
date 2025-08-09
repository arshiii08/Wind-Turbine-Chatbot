#!/bin/bash

# Create virtual environment
python -m venv venv

# Activate virtual environment (for Linux/macOS)
source venv/bin/activate

# For Windows, use: venv\Scripts\activate

# Install all dependencies listed in requirements.txt
pip install -r requirements.txt

# Run FastAPI app
uvicorn app:app --reload
