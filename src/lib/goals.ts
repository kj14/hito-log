import { Goal } from '../types/planner';
import { parseDate } from './time';

const MS_IN_DAY = 1000 * 60 * 60 * 24;

export interface GoalStats {
  totalLoggedMinutes: number;
  remainingMinutes: number;
  targetMinutes: number;
  progressRatio: number;
  averageDailyMinutes: number;
  requiredDailyMinutes: number;
  daysRemaining: number;
  projectedCompletionDate: Date | null;
  completionDeltaDays: number | null;
}

export function calculateGoalStats(goal: Goal, now: Date = new Date()): GoalStats {
  const targetMinutes = goal.targetEffortHours * 60;
  const totalLoggedMinutes = goal.logs.reduce((sum, log) => sum + Math.max(0, log.minutes), 0);
  const remainingMinutes = Math.max(0, targetMinutes - totalLoggedMinutes);
  const progressRatio = targetMinutes === 0 ? 0 : Math.min(1, totalLoggedMinutes / targetMinutes);

  const sortedLogs = [...goal.logs].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
  );

  const firstLogDate = sortedLogs.length > 0 ? new Date(sortedLogs[0].loggedAt) : null;
  const elapsedDays = firstLogDate
    ? Math.max(1, Math.ceil((now.getTime() - firstLogDate.getTime()) / MS_IN_DAY))
    : 0;
  const averageDailyMinutes = elapsedDays > 0 ? totalLoggedMinutes / elapsedDays : 0;

  const targetDate = parseDate(goal.targetDate);
  const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / MS_IN_DAY));
  const requiredDailyMinutes = daysRemaining > 0 ? remainingMinutes / daysRemaining : remainingMinutes;

  let projectedCompletionDate: Date | null = null;
  let completionDeltaDays: number | null = null;

  if (averageDailyMinutes > 0) {
    const daysToFinish = remainingMinutes / averageDailyMinutes;
    projectedCompletionDate = new Date(now.getTime() + daysToFinish * MS_IN_DAY);
    const deltaMs = projectedCompletionDate.getTime() - targetDate.getTime();
    completionDeltaDays = Math.round(deltaMs / MS_IN_DAY);
  }

  return {
    totalLoggedMinutes,
    remainingMinutes,
    targetMinutes,
    progressRatio,
    averageDailyMinutes,
    requiredDailyMinutes,
    daysRemaining,
    projectedCompletionDate,
    completionDeltaDays,
  };
}
