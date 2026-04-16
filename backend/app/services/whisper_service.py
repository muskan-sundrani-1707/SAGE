"""Lazy-loaded OpenAI Whisper for /api/voice/transcribe."""

from __future__ import annotations

import threading
from pathlib import Path
from typing import Optional

from app.config import WHISPER_MODEL_NAME

_lock = threading.Lock()
_model = None


def get_whisper_model():
    global _model
    with _lock:
        if _model is None:
            import whisper  # type: ignore — optional; loaded on first transcribe

            _model = whisper.load_model(WHISPER_MODEL_NAME)
        return _model


def transcribe_audio_file(path: Path, language: Optional[str] = None) -> dict:
    model = get_whisper_model()
    opts = {"fp16": False}
    if language in ("en", "hi"):
        opts["language"] = language
    result = model.transcribe(str(path), **opts)
    return {
        "text": (result.get("text") or "").strip(),
        "language": result.get("language"),
        "model": WHISPER_MODEL_NAME,
    }
