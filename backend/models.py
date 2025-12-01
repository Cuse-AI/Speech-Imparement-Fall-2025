from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class UserProfile(BaseModel):
    id: str
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None
    goals: Optional[List[str]] = None


class Exercise(BaseModel):
    id: str
    moduleId: str
    text: str
    phonemes: List[str]
    level: str


class Module(BaseModel):
    id: str
    title: str
    description: str
    level: str
    exercises: List[Exercise]


class Attempt(BaseModel):
    id: str
    exerciseId: str
    userId: str
    score: float
    accuracy: float
    feedback: Optional[str] = None
    createdAt: datetime


class Progress(BaseModel):
    userId: str
    moduleId: str
    completedExerciseIds: List[str]
    currentLevel: str
    updatedAt: datetime
