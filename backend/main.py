import random
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

from pydantic import BaseModel

from .models import Module


class OnboardingRequest(BaseModel):
    age: int
    readingLevel: str
    difficultyArea: str


class OnboardingResponse(BaseModel):
    userId: str


class PlacementRequest(BaseModel):
    userId: str
    audioBase64: str


class PlacementResponse(BaseModel):
    placementLevel: int


class ExerciseAttemptRequest(BaseModel):
    userId: str
    audioBase64: str


class ExerciseAttemptResponse(BaseModel):
    attemptId: str
    score: float
    accuracy: float
    feedback: str

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
    # In a real implementation we would persist onboarding data. For now, return a fake user id.
    fake_user_id = f"user-{random.randint(1000, 9999)}"
    return OnboardingResponse(userId=fake_user_id)


@app.post("/api/placement", response_model=PlacementResponse)
async def placement(_: PlacementRequest):
    # Generate a random placement level between 1 and 4.
    return PlacementResponse(placementLevel=random.randint(1, 4))


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


@app.get("/")
async def root():
    return {"message": "Speech practice API is running."}
