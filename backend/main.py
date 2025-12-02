import base64
import random
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

from pydantic import BaseModel

from .models import Module
from .services.azure_pronunciation import assess_pronunciation
from .services.azure_tts import synthesize_pronunciation
from .services.gpt_feedback import generate_feedback


class OnboardingRequest(BaseModel):
    age: int
    readingLevel: str
    difficultyArea: str


class OnboardingResponse(BaseModel):
    userId: str


class PronunciationAttempt(BaseModel):
    text: str
    audioBase64: str


class PlacementRequest(BaseModel):
    userId: str
    attempts: List[PronunciationAttempt]


class PlacementResponse(BaseModel):
    placementLevel: int
    averageScore: float


class ExerciseAttemptRequest(BaseModel):
    userId: str
    audioBase64: str


class ExerciseAttemptResponse(BaseModel):
    attemptId: str
    score: float
    accuracy: float
    feedback: str


class ExerciseEvaluationRequest(BaseModel):
    userId: str
    targetText: str
    audioBase64: str


class ExerciseEvaluationResponse(BaseModel):
    overallScore: float
    phonemes: List[dict]
    words: List[dict]
    feedback: str
    ttsBase64: str


app = FastAPI(title="Speech Practice API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODULES_PATH = Path(__file__).resolve().parents[1] / "frontend" / "src" / "data" / "modules.json"


def load_modules() -> List[Module]:
    if not MODULES_PATH.exists():
        raise HTTPException(status_code=500, detail="Modules file not found")

    with MODULES_PATH.open("r", encoding="utf-8") as f:
        raw_data = json.load(f)

    return [Module(**module) for module in raw_data]


@app.get("/api/modules", response_model=List[Module])
async def get_modules():
    return load_modules()


@app.post("/api/onboarding", response_model=OnboardingResponse)
async def onboarding(payload: OnboardingRequest):
    fake_user_id = f"user-{random.randint(1000, 9999)}"
    return OnboardingResponse(userId=fake_user_id)


@app.post("/api/placement", response_model=PlacementResponse)
async def placement(payload: PlacementRequest):
    if not payload.attempts:
        raise HTTPException(status_code=400, detail="At least one attempt is required")

    scores = []
    for attempt in payload.attempts:
        if not attempt.audioBase64:
            raise HTTPException(status_code=400, detail="Audio is required for each attempt")

        audio_bytes = base64.b64decode(attempt.audioBase64)
        result = assess_pronunciation(attempt.text, audio_bytes)
        if result.get("overallScore") is None:
            raise HTTPException(status_code=502, detail="Invalid pronunciation response")
        scores.append(result["overallScore"])

    average_score = sum(scores) / len(scores)

    if average_score >= 85:
        placement_level = 4
    elif average_score >= 70:
        placement_level = 3
    elif average_score >= 50:
        placement_level = 2
    else:
        placement_level = 1

    return PlacementResponse(placementLevel=placement_level, averageScore=average_score)


@app.post("/api/exercises/{exercise_id}/attempt", response_model=ExerciseAttemptResponse)
async def submit_exercise_attempt(exercise_id: str, payload: ExerciseAttemptRequest):
    if not payload.audioBase64:
        raise HTTPException(status_code=400, detail="Audio is required")

    score = round(random.uniform(60, 100), 1)
    accuracy = round(random.uniform(0.65, 0.98), 2)

    return ExerciseAttemptResponse(
        attemptId=f"attempt-{exercise_id}-{random.randint(1000, 9999)}",
        score=score,
        accuracy=accuracy,
        feedback="Thanks for submitting! Keep practicing this phrase.",
    )


@app.post("/api/exercise/evaluate", response_model=ExerciseEvaluationResponse)
async def evaluate_exercise(payload: ExerciseEvaluationRequest):
    if not payload.audioBase64:
        raise HTTPException(status_code=400, detail="Audio is required")

    audio_bytes = base64.b64decode(payload.audioBase64)
    result = assess_pronunciation(payload.targetText, audio_bytes)
    feedback = generate_feedback(payload.targetText, result.get("phonemes") or [])
    tts_audio = synthesize_pronunciation(payload.targetText)
    tts_base64 = base64.b64encode(tts_audio).decode("utf-8")

    if result.get("overallScore") is None:
        raise HTTPException(status_code=502, detail="Invalid pronunciation response")

    return ExerciseEvaluationResponse(**result, feedback=feedback, ttsBase64=tts_base64)


@app.get("/")
async def root():
    return {"message": "Speech practice API is running."}
