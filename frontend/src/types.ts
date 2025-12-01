export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  goals?: string[];
}

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  moduleId: string;
  text: string;
  phonemes: string[];
  level: ProficiencyLevel;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  level: ProficiencyLevel;
  exercises: Exercise[];
}

export interface Attempt {
  id: string;
  exerciseId: string;
  userId: string;
  score: number;
  accuracy: number;
  feedback?: string;
  createdAt: string;
}

export interface Progress {
  userId: string;
  moduleId: string;
  completedExerciseIds: string[];
  currentLevel: ProficiencyLevel;
  updatedAt: string;
}
