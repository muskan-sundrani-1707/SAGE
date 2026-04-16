"""Random Forest on custom Google Form survey features."""

from __future__ import annotations

import logging
import threading
from typing import Any, Optional

import joblib
import pandas as pd

from app.config import SURVEY_ENCODERS_PATH, SURVEY_MODEL_PATH

logger = logging.getLogger(__name__)

_lock = threading.Lock()
_survey_load_attempted = False
_model = None
_meta: Optional[dict] = None


def get_survey_artifacts():
    global _survey_load_attempted, _model, _meta
    with _lock:
        if not _survey_load_attempted:
            _survey_load_attempted = True
            _meta = {}
            if SURVEY_MODEL_PATH.is_file():
                try:
                    _model = joblib.load(SURVEY_MODEL_PATH)
                    if SURVEY_ENCODERS_PATH.is_file():
                        _meta = joblib.load(SURVEY_ENCODERS_PATH) or {}
                except Exception as e:
                    logger.warning(
                        "Could not load survey model from %s (wrong sklearn version or corrupt file). "
                        "Re-run: PYTHONPATH=. python scripts/train_survey_model.py — %s",
                        SURVEY_MODEL_PATH,
                        e,
                    )
                    _model = None
                    _meta = {}
            else:
                _model = None
        return _model, _meta or {}


def predict_survey(
    age: float,
    education_level: str,
    smartphone_usage: str,
    confidence_level: float,
    task_completion_time: float,
) -> dict[str, Any]:
    model, meta = get_survey_artifacts()
    if model is None:
        return {"error": "model_not_trained", "detail": f"Train first; expected {SURVEY_MODEL_PATH}"}

    row = pd.DataFrame(
        [
            {
                "age": float(age),
                "education_level": str(education_level or "unknown").strip() or "unknown",
                "smartphone_usage": str(smartphone_usage or "unknown").strip() or "unknown",
                "confidence_level": float(confidence_level),
                "task_completion_time": float(task_completion_time),
            }
        ]
    )
    feature_cols = meta.get("feature_cols", list(row.columns))
    row = row[feature_cols]

    proba = model.predict_proba(row)[0]
    pred = int(model.predict(row)[0])
    p_risk = float(proba[1]) if len(proba) > 1 else float(pred)

    return {
        "at_risk_predicted": pred,
        "at_risk_probability": round(p_risk, 4),
        "target_mode_note": meta.get("target_mode", "unknown"),
        "model": "random_forest",
    }
