import { LifeProfile } from '../types/planner';

const MS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_YEAR = 365.25;

export const SECONDS_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE;
export const SECONDS_IN_YEAR = DAYS_IN_YEAR * SECONDS_IN_DAY;

export interface LifeOverview {
  ageYears: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
}

export interface DurationBreakdown {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function calculateAgeYears(birthDate: string, now: Date = new Date()): number {
  const birth = parseDate(birthDate);
  const diff = now.getTime() - birth.getTime();
  return diff / (SECONDS_IN_YEAR * MS_IN_SECOND);
}

export function calculateLifeOverview(
  profile: LifeProfile,
  now: Date = new Date(),
): LifeOverview {
  const totalSeconds = profile.lifeExpectancyYears * SECONDS_IN_YEAR;
  const birth = parseDate(profile.birthDate);
  const elapsedSeconds = Math.max(0, (now.getTime() - birth.getTime()) / MS_IN_SECOND);
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  const progress = Math.min(1, elapsedSeconds / totalSeconds);

  return {
    ageYears: calculateAgeYears(profile.birthDate, now),
    elapsedSeconds,
    remainingSeconds,
    totalSeconds,
    progress,
  };
}

export function breakdownDuration(seconds: number): DurationBreakdown {
  const clamped = Math.max(0, seconds);
  const years = Math.floor(clamped / SECONDS_IN_YEAR);
  let remainder = clamped - years * SECONDS_IN_YEAR;

  const days = Math.floor(remainder / SECONDS_IN_DAY);
  remainder -= days * SECONDS_IN_DAY;

  const hours = Math.floor(remainder / (MINUTES_IN_HOUR * SECONDS_IN_MINUTE));
  remainder -= hours * MINUTES_IN_HOUR * SECONDS_IN_MINUTE;

  const minutes = Math.floor(remainder / SECONDS_IN_MINUTE);
  remainder -= minutes * SECONDS_IN_MINUTE;

  const secondsInt = Math.floor(remainder);
  const milliseconds = Math.floor((remainder - secondsInt) * MS_IN_SECOND);

  return {
    years,
    days,
    hours,
    minutes,
    seconds: secondsInt,
    milliseconds,
  };
}

export function formatDuration(seconds: number): string {
  const parts = breakdownDuration(seconds);
  const segments = [
    parts.years ? `${parts.years}年` : null,
    parts.days ? `${parts.days}日` : null,
    `${parts.hours.toString().padStart(2, '0')}時間`,
    `${parts.minutes.toString().padStart(2, '0')}分`,
    `${parts.seconds.toString().padStart(2, '0')}.${Math.floor(parts.milliseconds / 10)
      .toString()
      .padStart(2, '0')}秒`,
  ].filter(Boolean);

  return segments.join(' ');
}

export function formatPercentage(progress: number): string {
  return `${(progress * 100).toFixed(2)}%`;
}
