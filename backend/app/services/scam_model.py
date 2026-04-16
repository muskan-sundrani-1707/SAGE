"""Load trained TF-IDF + Logistic Regression pipeline for SMS/phishing-style text."""

from __future__ import annotations

import logging
import threading
from typing import Any

import joblib

from app.config import SCAM_PIPELINE_PATH

logger = logging.getLogger(__name__)

_lock = threading.Lock()
_scam_load_attempted = False
_pipeline = None


def get_pipeline():
    global _scam_load_attempted, _pipeline
    with _lock:
        if not _scam_load_attempted:
            _scam_load_attempted = True
            if SCAM_PIPELINE_PATH.is_file():
                try:
                    _pipeline = joblib.load(SCAM_PIPELINE_PATH)
                except Exception as e:
                    logger.warning(
                        "Could not load scam pipeline from %s (re-train with your sklearn version). — %s",
                        SCAM_PIPELINE_PATH,
                        e,
                    )
                    _pipeline = None
            else:
                _pipeline = None
        return _pipeline


def predict_scam(text: str) -> dict[str, Any]:
    text = (text or "").strip()
    if not text:
        return {"error": "empty_text"}

    pipe = get_pipeline()
    if pipe is None:
        return {"error": "model_not_trained", "detail": f"Train first; expected {SCAM_PIPELINE_PATH}"}

    proba = pipe.predict_proba([text])[0]
    classes = list(getattr(pipe, "classes_", []))
    if not classes and hasattr(pipe, "named_steps"):
        classes = list(pipe.named_steps["clf"].classes_)
    idx_spam = next((i for i, c in enumerate(classes) if str(c).lower() == "spam"), None)
    if idx_spam is None and len(classes) >= 2:
        idx_spam = 1
    elif idx_spam is None:
        idx_spam = 0

    spam_p = float(proba[idx_spam])
    label = "spam" if spam_p >= 0.5 else "ham"
    return {
        "label": label,
        "spam_probability": round(spam_p, 4),
        "ham_probability": round(1.0 - spam_p, 4),
        "model": "tfidf_logistic_regression",
    }
