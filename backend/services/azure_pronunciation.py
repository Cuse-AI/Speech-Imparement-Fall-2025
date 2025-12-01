import base64
import json
import os
from typing import Dict, List

import httpx
from fastapi import HTTPException


AZURE_LANGUAGE = os.getenv("AZURE_SPEECH_LANGUAGE", "en-US")


def _build_assessment_header(text: str) -> str:
    config = {
        "ReferenceText": text,
        "GradingSystem": "HundredMark",
        "Granularity": "Phoneme",
        "Dimension": "Comprehensive",
        "EnableMiscue": True,
    }
    return base64.b64encode(json.dumps(config).encode("utf-8")).decode("utf-8")


def _extract_scores(result_json: Dict) -> Dict:
    nbest = (result_json or {}).get("NBest", [])
    best = nbest[0] if nbest else {}

    pron_assessment = best.get("PronunciationAssessment", {})
    overall_score = pron_assessment.get("PronScore")

    phonemes: List[Dict] = []
    words: List[Dict] = []

    for word_info in best.get("Words", []) or []:
        word_pron = word_info.get("PronunciationAssessment", {})
        words.append(
            {
                "word": word_info.get("Word", ""),
                "score": word_pron.get("PronScore")
                or word_pron.get("AccuracyScore")
                or 0,
            }
        )

        for phoneme_info in word_info.get("Phonemes", []) or []:
            phoneme_pron = phoneme_info.get("PronunciationAssessment", {})
            phonemes.append(
                {
                    "ph": phoneme_info.get("Phoneme", ""),
                    "score": phoneme_pron.get("PronScore")
                    or phoneme_pron.get("AccuracyScore")
                    or 0,
                }
            )

    return {
        "overallScore": overall_score,
        "phonemes": phonemes,
        "words": words,
    }


def assess_pronunciation(text: str, audio_bytes: bytes) -> Dict:
    """Send audio to Azure Pronunciation Assessment and return parsed scores."""

    subscription_key = os.getenv("AZURE_SPEECH_KEY")
    region = os.getenv("AZURE_SPEECH_REGION")

    if not subscription_key or not region:
        raise HTTPException(
            status_code=500,
            detail="Azure Speech credentials are not configured",
        )

    url = (
        f"https://{region}.stt.speech.microsoft.com/"
        "speech/recognition/conversation/cognitiveservices/v1"
    )

    headers = {
        "Ocp-Apim-Subscription-Key": subscription_key,
        "Content-Type": "audio/webm; codecs=opus",
        "Accept": "application/json",
        "Pronunciation-Assessment": _build_assessment_header(text),
    }

    try:
        response = httpx.post(
            url,
            params={"language": AZURE_LANGUAGE},
            headers=headers,
            content=audio_bytes,
            timeout=20,
        )
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Azure assessment failed: {exc.response.text}",
        ) from exc
    except httpx.HTTPError as exc:  # pragma: no cover - network failure
        raise HTTPException(status_code=502, detail="Azure assessment unavailable") from exc

    return _extract_scores(response.json())
