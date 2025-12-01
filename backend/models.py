from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr

ProficiencyLevel = Literal["beginner", "intermediate", "advanced"]


class UserProfile(BaseModel):
    id: str
    name: str
    email: EmailStr
    avatarUrl: Optional[str] = None
    goals: Optional[List[str]] = None


class Exercise(BaseModel):
    id: str
    moduleId: str
    text: str
    phonemes: List[str]
    level: ProficiencyLevel


class Module(BaseModel):
    id: str
    title: str
    description: str
    level: ProficiencyLevel
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
    currentLevel: ProficiencyLevel
    updatedAt: datetime
