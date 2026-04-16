"""
SAGE backend: ML scam checker, Whisper STT, survey Random Forest, gTTS.
"""

from __future__ import annotations

import importlib.util
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.config import BACKEND_ROOT, MAX_AUDIO_BYTES
from app.services import scam_model, survey_model, tts_service
from app.services.whisper_service import transcribe_audio_file

app = FastAPI(title="SAGE API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    scam_ok = scam_model.get_pipeline() is not None
    survey_m, _ = survey_model.get_survey_artifacts()
    whisper_spec = importlib.util.find_spec("whisper")
    return {
        "status": "ok",
        "scam_model_loaded": scam_ok,
        "survey_model_loaded": survey_m is not None,
        "whisper_available": whisper_spec is not None,
    }


class ScamCheckBody(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000)


@app.post("/api/scam/check")
def check_scam(body: ScamCheckBody):
    result = scam_model.predict_scam(body.text)
    if result.get("error") == "empty_text":
        raise HTTPException(status_code=400, detail="Text is required")
    if result.get("error") == "model_not_trained":
        raise HTTPException(status_code=503, detail=result.get("detail", "Model not trained"))
    return result


class SurveyPredictBody(BaseModel):
    age: float = Field(..., ge=1, le=120)
    education_level: str = Field(..., min_length=1, max_length=200)
    smartphone_usage: str = Field(..., min_length=1, max_length=50)
    confidence_level: float = Field(..., ge=1, le=5)
    task_completion_time: float = Field(..., ge=0)


@app.post("/api/survey/predict")
def predict_survey(body: SurveyPredictBody):
    result = survey_model.predict_survey(
        age=body.age,
        education_level=body.education_level,
        smartphone_usage=body.smartphone_usage,
        confidence_level=body.confidence_level,
        task_completion_time=body.task_completion_time,
    )
    if result.get("error") == "model_not_trained":
        raise HTTPException(status_code=503, detail=result.get("detail", "Survey model not trained"))
    return result


@app.post("/api/voice/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: Optional[str] = Query(None, description="Optional hint: en or hi"),
):
    raw = await file.read()
    if len(raw) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio too large")

    suffix = Path(file.filename or "audio").suffix.lower()
    if suffix not in (".wav", ".webm", ".mp3", ".m4a", ".ogg", ".mp4", ".mpeg", ".mpga"):
        suffix = ".webm"

    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(raw)
            tmp_path = Path(tmp.name)
        try:
            out = transcribe_audio_file(tmp_path, language=language)
        finally:
            tmp_path.unlink(missing_ok=True)
    except Exception as e:  # pragma: no cover — whisper / ffmpeg issues
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e!s}") from e

    return out


@app.get("/api/tts")
def tts(
    text: str = Query(..., min_length=1, max_length=5000),
    lang: str = Query("en"),
):
    try:
        audio = tts_service.synthesize(text, lang=lang)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return Response(content=audio, media_type="audio/mpeg")


class TtsBody(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


@app.post("/api/tts")
def tts_post(body: TtsBody, lang: str = Query("en")):
    try:
        audio = tts_service.synthesize(body.text, lang=lang)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return Response(content=audio, media_type="audio/mpeg")


# Serve project root (index.html, css/, js/) so the UI and API share one origin on :8000.
_project_root = BACKEND_ROOT.parent
if (_project_root / "index.html").is_file():
    app.mount(
        "/",
        StaticFiles(directory=str(_project_root), html=True),
        name="frontend",
    )
