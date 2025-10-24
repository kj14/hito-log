import { LifeProfile, Relationship } from '../types/planner';
import { SECONDS_IN_DAY, calculateLifeOverview } from './time';

export interface RelationshipProjection {
  relationship: Relationship;
  pairRemainingSeconds: number;
  remainingMeetings: number;
  totalSharedHours: number;
  otherOverview: {
    ageYears: number;
    remainingSeconds: number;
  };
}

export function calculateRelationshipProjection(
  selfProfile: LifeProfile,
  relationship: Relationship,
  now: Date = new Date(),
): RelationshipProjection {
  const selfOverview = calculateLifeOverview(selfProfile, now);
  const otherOverview = calculateLifeOverview(
    {
      name: relationship.name,
      birthDate: relationship.birthDate,
      lifeExpectancyYears: relationship.lifeExpectancyYears,
    },
    now,
  );

  const pairRemainingSeconds = Math.min(
    selfOverview.remainingSeconds,
    otherOverview.remainingSeconds,
  );

  const intervalSeconds = relationship.meetingIntervalDays * SECONDS_IN_DAY;
  const remainingMeetings = intervalSeconds
    ? Math.max(0, Math.floor(pairRemainingSeconds / intervalSeconds))
    : 0;

  const totalSharedHours = (remainingMeetings * relationship.averageSessionMinutes) / 60;

  return {
    relationship,
    pairRemainingSeconds,
    remainingMeetings,
    totalSharedHours,
    otherOverview: {
      ageYears: otherOverview.ageYears,
      remainingSeconds: otherOverview.remainingSeconds,
    },
  };
}
