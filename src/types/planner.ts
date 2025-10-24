export type Sex = 'male' | 'female' | 'other' | 'unspecified';

export interface LifeProfile {
  name: string;
  birthDate: string; // ISO string (YYYY-MM-DD)
  lifeExpectancyYears: number;
  sex?: Sex;
}

export interface Relationship {
  id: string;
  name: string;
  birthDate: string;
  lifeExpectancyYears: number;
  meetingIntervalDays: number;
  averageSessionMinutes: number;
  note?: string;
}

export interface GoalLogEntry {
  id: string;
  loggedAt: string; // ISO datetime string
  minutes: number;
  note?: string;
}

export interface Goal {
  id: string;
  title: string;
  category?: string;
  targetEffortHours: number;
  targetDate: string;
  logs: GoalLogEntry[];
  motivationNote?: string;
}
