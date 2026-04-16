"""Paths and runtime settings for the SAGE backend."""

from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_ROOT / "data"
MODELS_DIR = BACKEND_ROOT / "models_output"

SPAM_CSV = DATA_DIR / "spam.csv"
PHISHING_CSV = DATA_DIR / "phishing_emails.csv"
SURVEY_CSV = DATA_DIR / "survey_responses.csv"

SCAM_PIPELINE_PATH = MODELS_DIR / "scam_tfidf_logreg.joblib"
SURVEY_MODEL_PATH = MODELS_DIR / "survey_rf.joblib"
SURVEY_ENCODERS_PATH = MODELS_DIR / "survey_encoders.joblib"

# Whisper: tiny/base/small/medium/large — base is a reasonable default on CPU
WHISPER_MODEL_NAME = "base"

# Max upload size hint (FastAPI reads full body; keep recordings short)
MAX_AUDIO_BYTES = 25 * 1024 * 1024
