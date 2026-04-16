"""Google Text-to-Speech (gTTS) for /api/tts."""

from __future__ import annotations

import io

from gtts import gTTS


def synthesize(text: str, lang: str = "en") -> bytes:
    text = (text or "").strip()
    if not text:
        raise ValueError("empty text")
    lang = (lang or "en").lower()
    if lang not in ("en", "hi"):
        lang = "en"
    buf = io.BytesIO()
    tts = gTTS(text=text, lang=lang, slow=False)
    tts.write_to_fp(buf)
    return buf.getvalue()
