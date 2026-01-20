export type Gender = 'male' | 'female';

export interface User {
  id: string;
  email: string;
  name: string;
  gender: Gender | null;
  height: number | null;
  weight: number | null;
  createdAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  gender?: Gender;
  height?: number;
  weight?: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number | null;
  order: number;
  workoutId: string;
  createdAt: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isDeleted: boolean;
  aiGenerated: boolean;
  userId: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutLog {
  id: string;
  loggedDate: string;
  notes: string | null;
  userId: string;
  workoutId: string;
  workout?: Workout;
  createdAt: string;
}

export interface CalendarDay {
  date: string;
  logs: WorkoutLog[];
}

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalThisMonth: number;
  weeklyFrequency: number;
  totalWorkouts: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CreateExerciseDto {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  order: number;
}

export interface CreateWorkoutDto {
  name: string;
  description?: string;
  exercises: CreateExerciseDto[];
}

export interface UpdateWorkoutDto {
  name?: string;
  description?: string;
  exercises?: CreateExerciseDto[];
}

export interface GenerateWorkoutDto {
  prompt: string;
  numberOfWorkouts?: number;
}

export interface GeneratedWorkout {
  name: string;
  description: string;
  exercises: CreateExerciseDto[];
}


