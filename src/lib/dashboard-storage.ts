import { randomUUID } from 'node:crypto';

import { Goal, LifeProfile, Relationship } from '../types/planner';
import { getServiceSupabaseClient } from './supabase/server';
import { Database } from '../types/database';

const PROFILE_COOKIE = 'hito_profile_token';

export interface DashboardRecord {
  profileId: string;
  profileToken: string;
  profile: LifeProfile;
  relationships: Relationship[];
  goals: Goal[];
}

export interface DashboardPayload {
  profileId: string;
  profile: LifeProfile;
  relationships: Relationship[];
  goals: Goal[];
}

function mapProfileRow(row: Database['public']['Tables']['life_profiles']['Row']): LifeProfile {
  return {
    name: row.name,
    birthDate: row.birth_date,
    lifeExpectancyYears: Number(row.life_expectancy_years),
    sex: row.sex,
  };
}

function mapRelationshipRow(
  row: Database['public']['Tables']['relationships']['Row'],
): Relationship {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    lifeExpectancyYears: Number(row.life_expectancy_years),
    meetingIntervalDays: row.meeting_interval_days,
    averageSessionMinutes: row.average_session_minutes,
    note: row.note ?? undefined,
  };
}

function mapGoalRows(
  goalRows: Database['public']['Tables']['goals']['Row'][],
  logRows: Database['public']['Tables']['goal_logs']['Row'][],
): Goal[] {
  const logsGrouped = logRows.reduce<Record<string, Goal['logs']>>((acc, log) => {
    acc[log.goal_id] = acc[log.goal_id] ?? [];
    acc[log.goal_id].push({
      id: log.id,
      loggedAt: log.logged_at,
      minutes: log.minutes,
      note: log.note ?? undefined,
    });
    return acc;
  }, {});

  return goalRows.map((goal) => ({
    id: goal.id,
    title: goal.title,
    category: goal.category ?? undefined,
    targetEffortHours: Number(goal.target_effort_hours),
    targetDate: goal.target_date,
    motivationNote: goal.motivation_note ?? undefined,
    logs: (logsGrouped[goal.id] ?? []).sort((a, b) => (a.loggedAt > b.loggedAt ? 1 : -1)),
  }));
}

export async function fetchDashboard(profileToken?: string): Promise<DashboardRecord> {
  const client = getServiceSupabaseClient();

  if (profileToken) {
    const { data: profileRow, error } = await client
      .from('life_profiles')
      .select('*')
      .eq('profile_token', profileToken)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (profileRow) {
      const [{ data: relationshipRows, error: relationshipError }, { data: goalRows, error: goalError }] = await Promise.all([
        client.from('relationships').select('*').eq('profile_id', profileRow.id).order('created_at', { ascending: true }),
        client.from('goals').select('*').eq('profile_id', profileRow.id).order('created_at', { ascending: true }),
      ]);

      if (relationshipError) {
        throw relationshipError;
      }
      if (goalError) {
        throw goalError;
      }

      const goalIds = goalRows.map((goal) => goal.id);
      const { data: logRows, error: logError } = goalIds.length
        ? await client
            .from('goal_logs')
            .select('*')
            .in('goal_id', goalIds)
            .order('logged_at', { ascending: true })
        : { data: [], error: null };

      if (logError) {
        throw logError;
      }

      return {
        profileId: profileRow.id,
        profileToken: profileRow.profile_token,
        profile: mapProfileRow(profileRow),
        relationships: relationshipRows.map(mapRelationshipRow),
        goals: mapGoalRows(goalRows, logRows ?? []),
      };
    }
  }

  return createDefaultDashboard();
}

function buildDefaultRelationships(): Relationship[] {
  return [
    {
      id: randomUUID(),
      name: '母',
      birthDate: '1965-05-12',
      lifeExpectancyYears: 88,
      meetingIntervalDays: 30,
      averageSessionMinutes: 180,
    },
    {
      id: randomUUID(),
      name: '親友',
      birthDate: '1991-09-02',
      lifeExpectancyYears: 84,
      meetingIntervalDays: 14,
      averageSessionMinutes: 120,
    },
  ];
}

function buildDefaultGoals(): Goal[] {
  const goalId = randomUUID();
  const now = new Date();
  return [
    {
      id: goalId,
      title: 'TOEIC 900 点突破',
      category: '学習',
      targetEffortHours: 200,
      targetDate: new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10),
      motivationNote: '海外クライアントとの商談を一人で担当できるようになる',
      logs: [
        {
          id: randomUUID(),
          loggedAt: now.toISOString(),
          minutes: 45,
        },
        {
          id: randomUUID(),
          loggedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          minutes: 30,
        },
      ],
    },
  ];
}

async function createDefaultDashboard(): Promise<DashboardRecord> {
  const client = getServiceSupabaseClient();
  const profileToken = randomUUID();

  const { data: profileRow, error: profileError } = await client
    .from('life_profiles')
    .insert({
      profile_token: profileToken,
      name: 'あなた',
      birth_date: '1990-01-01',
      life_expectancy_years: 84,
      sex: 'unspecified',
    })
    .select()
    .single();

  if (profileError || !profileRow) {
    throw profileError ?? new Error('プロフィールの初期化に失敗しました');
  }

  const relationships = buildDefaultRelationships();
  const goals = buildDefaultGoals();

  if (relationships.length > 0) {
    const { error: relationshipError } = await client.from('relationships').insert(
      relationships.map((relationship) => ({
        id: relationship.id,
        profile_id: profileRow.id,
        name: relationship.name,
        birth_date: relationship.birthDate,
        life_expectancy_years: relationship.lifeExpectancyYears,
        meeting_interval_days: relationship.meetingIntervalDays,
        average_session_minutes: relationship.averageSessionMinutes,
        note: relationship.note ?? null,
      })),
    );
    if (relationshipError) {
      throw relationshipError;
    }
  }

  if (goals.length > 0) {
    const { error: goalError } = await client.from('goals').insert(
      goals.map((goal) => ({
        id: goal.id,
        profile_id: profileRow.id,
        title: goal.title,
        category: goal.category ?? null,
        target_effort_hours: goal.targetEffortHours,
        target_date: goal.targetDate,
        motivation_note: goal.motivationNote ?? null,
      })),
    );
    if (goalError) {
      throw goalError;
    }

    const goalLogs = goals.flatMap((goal) =>
      goal.logs.map((log) => ({
        id: log.id,
        goal_id: goal.id,
        logged_at: log.loggedAt,
        minutes: log.minutes,
        note: log.note ?? null,
      })),
    );

    if (goalLogs.length > 0) {
      const { error: logError } = await client.from('goal_logs').insert(goalLogs);
      if (logError) {
        throw logError;
      }
    }
  }

  return {
    profileId: profileRow.id,
    profileToken: profileToken,
    profile: mapProfileRow(profileRow),
    relationships,
    goals,
  };
}

export async function saveDashboard(
  profileToken: string,
  payload: DashboardPayload,
): Promise<DashboardRecord> {
  const client = getServiceSupabaseClient();

  const profileId = payload.profileId;
  const { error: profileError } = await client
    .from('life_profiles')
    .update({
      name: payload.profile.name,
      birth_date: payload.profile.birthDate,
      life_expectancy_years: payload.profile.lifeExpectancyYears,
      sex: payload.profile.sex ?? 'unspecified',
    })
    .eq('id', profileId)
    .eq('profile_token', profileToken);

  if (profileError) {
    throw profileError;
  }

  const { error: deleteRelationshipsError } = await client
    .from('relationships')
    .delete()
    .eq('profile_id', profileId);

  if (deleteRelationshipsError) {
    throw deleteRelationshipsError;
  }

  if (payload.relationships.length > 0) {
    const { error: insertRelationshipsError } = await client.from('relationships').insert(
      payload.relationships.map((relationship) => ({
        id: relationship.id,
        profile_id: profileId,
        name: relationship.name,
        birth_date: relationship.birthDate,
        life_expectancy_years: relationship.lifeExpectancyYears,
        meeting_interval_days: relationship.meetingIntervalDays,
        average_session_minutes: relationship.averageSessionMinutes,
        note: relationship.note ?? null,
      })),
    );

    if (insertRelationshipsError) {
      throw insertRelationshipsError;
    }
  }

  const { error: deleteGoalsError } = await client.from('goals').delete().eq('profile_id', profileId);

  if (deleteGoalsError) {
    throw deleteGoalsError;
  }

  if (payload.goals.length > 0) {
    const goalRows = payload.goals.map((goal) => ({
      id: goal.id,
      profile_id: profileId,
      title: goal.title,
      category: goal.category ?? null,
      target_effort_hours: goal.targetEffortHours,
      target_date: goal.targetDate,
      motivation_note: goal.motivationNote ?? null,
    }));

    const { error: insertGoalsError } = await client.from('goals').insert(goalRows);

    if (insertGoalsError) {
      throw insertGoalsError;
    }

    const goalLogs = payload.goals.flatMap((goal) =>
      goal.logs.map((log) => ({
        id: log.id,
        goal_id: goal.id,
        logged_at: log.loggedAt,
        minutes: log.minutes,
        note: log.note ?? null,
      })),
    );

    if (goalLogs.length > 0) {
      const { error: insertLogsError } = await client.from('goal_logs').insert(goalLogs);
      if (insertLogsError) {
        throw insertLogsError;
      }
    }
  }

  return {
    profileId,
    profileToken,
    profile: payload.profile,
    relationships: payload.relationships,
    goals: payload.goals,
  };
}

export { PROFILE_COOKIE };
