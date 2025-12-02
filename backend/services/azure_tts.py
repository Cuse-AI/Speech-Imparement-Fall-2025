import os
from typing import Final

import httpx
from fastapi import HTTPException


DEFAULT_VOICE: Final[str] = "en-US-JennyNeural"
FALLBACK_VOICE: Final[str] = "en-US-GuyNeural"
AUDIO_FORMAT: Final[str] = "audio-16khz-32kbitrate-mono-mp3"


def _get_voice_name() -> str:
    configured = os.getenv("AZURE_TTS_VOICE", DEFAULT_VOICE)
    allowed = {DEFAULT_VOICE, FALLBACK_VOICE}
    return configured if configured in allowed else DEFAULT_VOICE


def synthesize_pronunciation(text: str) -> bytes:
    """Generate TTS audio for the provided text using Azure Speech."""

    subscription_key = os.getenv("AZURE_SPEECH_KEY")
    region = os.getenv("AZURE_SPEECH_REGION")

    if not subscription_key or not region:
        raise HTTPException(
            status_code=500, detail="Azure Speech credentials are not configured"
        )

    voice_name = _get_voice_name()
    ssml = (
        "<speak version=\"1.0\" xml:lang=\"en-US\">"
        f"<voice xml:lang=\"en-US\" name=\"{voice_name}\">"
        f"{text}"
        "</voice></speak>"
    )

    url = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
    headers = {
        "Ocp-Apim-Subscription-Key": subscription_key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": AUDIO_FORMAT,
        "User-Agent": "speech-practice-app",
    }

    try:
        response = httpx.post(url, headers=headers, content=ssml.encode("utf-8"), timeout=20)
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Azure TTS failed: {exc.response.text}",
        ) from exc
    except httpx.HTTPError as exc:  # pragma: no cover - network failure
        raise HTTPException(status_code=502, detail="Azure TTS unavailable") from exc

    return response.content
