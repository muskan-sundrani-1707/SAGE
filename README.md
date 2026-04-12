
# SAGE — Smart Assistance for Guided Education
A bilingual (English / Hindi), accessibility-minded web app that helps senior users build digital confidence. It combines a static frontend with a **FastAPI** backend for **ML-based scam detection**, optional **speech recognition** (browser or Whisper), and **text-to-speech** (browser or gTTS).
---
## Table of contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Datasets and training](#datasets-and-training)
- [Running the application](#running-the-application)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [License](#license)
---
## Overview
**SAGE** (Smart Assistance for Guided Education) is a digital literacy assistant focused on:
- Simple **voice-style interaction** (keyword-based answers + optional server STT/TTS).
- **Scam / spam awareness** using a trained classifier on SMS-style text.
- **Short tutorials** (smartphone basics, WhatsApp, UPI, online safety, government services).
- **Accessibility**: language toggle, large text mode, and listen-to-page snippets.
The frontend is plain **HTML, CSS, and JavaScript**. The backend serves both the **REST API** and, when run with Uvicorn, the **static files** from the project root for a single-origin setup.
---
## Features
| Area | Description |
|------|-------------|
| **Scam checker** | Sends message text to `/api/scam/check` (**TF–IDF + logistic regression**). If the model is missing or the API is offline, the UI falls back to keyword heuristics. |
| **Voice assistant** | **Browser Speech Recognition** by default. If the API reports Whisper as available, the UI can **record audio** and call `/api/voice/transcribe`. Responses can be spoken via **gTTS** (server) or the browser **Speech Synthesis** API. |
| **Learn** | Card-based topics open a modal with HTML content in the selected language. |
| **Survey model (optional)** | `POST /api/survey/predict` uses a **Random Forest** trained on your own CSV (e.g. Google Form export). |
| **Languages** | UI strings and assistant replies in **English** and **Hindi** (`data-en` / `data-hi` attributes and `js/data.js`). |
---
## Architecture
- **Client**: static pages (`index.html`, `css/`, `js/`). API base URL is resolved in `js/config.js` (same origin on port `8000`, or `http://127.0.0.1:8000` when opened from another origin).
- **Server**: **FastAPI** application in `backend/app/main.py`, with CORS enabled for local development.
- **Models**: trained scripts write **joblib** artifacts under `backend/models_output/` (keep this directory out of version control if you prefer).
---
## Repository structure
. ├── index.html # Main page ├── css/ # Stylesheets ├── js/ # Frontend logic (config, voice, scam, learn, accessibility, TTS helpers) ├── backend/ │ ├── app/ # FastAPI app, services, survey preprocessing │ ├── scripts/ # train_scam_model.py, train_survey_model.py │ ├── data/ # spam.csv, survey_responses.csv, optional phishing CSV │ ├── models_output/ # Generated *.joblib (after training) │ └── requirements.txt └── README.md

---
## Prerequisites
- **Python 3.9+** (3.10+ recommended).
- **pip** and a **virtual environment** (recommended).
- For the **scam model**: place Kaggle **UCI SMS Spam Collection** `spam.csv` as `backend/data/spam.csv`.
- **Optional**: phishing email CSV as `backend/data/phishing_emails.csv` for multi-source training.
- **Optional Whisper**: `openai-whisper` in the same environment as the API; **ffmpeg** on the system for common audio formats.
- **Optional gTTS**: requires **network** access to Google’s TTS endpoint when using `/api/tts`.
---
## Installation
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -U pip
pip install -r requirements.txt
If you do not need Whisper initially, you may install a smaller subset (FastAPI, Uvicorn, scikit-learn, pandas, numpy, joblib, gTTS, etc.) and add Whisper later.

Datasets and training
Scam classifier (required for ML scam checks)
Download SMS Spam Collection Dataset from Kaggle.
Save spam.csv to backend/data/spam.csv.
(Optional) Add a phishing CSV as backend/data/phishing_emails.csv (see training script for column handling).
Train:
cd backend
source .venv/bin/activate
PYTHONPATH=. python scripts/train_scam_model.py
Survey / Random Forest (optional)
Export your Google Form (or equivalent) to CSV.
Save as backend/data/survey_responses.csv (see scripts/train_survey_model.py for expected columns and target logic).
Train:
PYTHONPATH=. python scripts/train_survey_model.py
Note: Train and serve with a compatible scikit-learn version; mismatches can cause load warnings or unpickling errors.

Running the application
From the backend directory, with the virtual environment activated:

PYTHONPATH=. uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
Then open:

Web UI: http://127.0.0.1:8000/
Interactive API docs: http://127.0.0.1:8000/docs
Health check: http://127.0.0.1:8000/api/health
Stop the server with Ctrl+C.

Configuration
API base URL (frontend)
Served from Uvicorn on port 8000: the default logic uses same-origin API calls.
Served from Live Server or another port: set before loading config.js:
<script>window.SAGE_API_BASE = 'http://127.0.0.1:8000';</script>
Flags (js/config.js)
SAGE_USE_WHISPER: when false, forces browser speech-to-text even if Whisper is installed.
SAGE_USE_GTTS: when false, prefers browser TTS for English (Hindi still benefits from gTTS when the server is available).
Health response
GET /api/health returns, among other fields:

scam_model_loaded
survey_model_loaded
whisper_available (whether the whisper package is importable in the server environment)
API reference
Method	Path	Description
GET
/api/health
Service and model availability
POST
/api/scam/check
JSON body: { "text": "..." }
POST
/api/voice/transcribe
Multipart file upload (audio)
POST
/api/survey/predict
Survey feature JSON (see OpenAPI schema)
GET
/api/tts
Query: text, lang (en | hi)
POST
/api/tts
JSON body: { "text": "..." }, query: lang
Full schemas: /docs (Swagger UI).

Troubleshooting
Issue	Suggestion
Scam endpoint returns 503
Run train_scam_model.py and ensure models_output contains the pipeline joblib.
Whisper transcription fails
Install Whisper and ffmpeg; check server logs. Or set SAGE_USE_WHISPER = false to use the browser recognizer.
Hindi does not speak
Ensure the backend is running and gTTS can reach the network; Hindi often works better via gTTS than via the OS browser voice.
CORS or fetch errors
Confirm SAGE_API_BASE matches your API URL and that Uvicorn is running.
Pickle / sklearn errors
Retrain models in the same environment (same sklearn) as production.
