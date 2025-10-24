'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { LifeCountdown } from '../components/life-countdown';
import { RelationshipPlanner } from '../components/relationship-planner';
import { GoalTracker } from '../components/goal-tracker';
import { Goal, LifeProfile, Relationship } from '../types/planner';

interface DashboardResponse {
  profileId: string;
  profile: LifeProfile;
  relationships: Relationship[];
  goals: Goal[];
}

export default function Home() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<LifeProfile | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load dashboard');
        }
        const data = (await response.json()) as DashboardResponse;
        if (ignore) {
          return;
        }
        setProfileId(data.profileId);
        setProfile(data.profile);
        setRelationships(data.relationships ?? []);
        setGoals(data.goals ?? []);
        setIsDirty(false);
        setLastSavedAt(null);
        setError(null);
      } catch (loadError) {
        console.error(loadError);
        if (!ignore) {
          setError('データの取得に失敗しました。時間をおいて再度お試しください。');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleProfileChange = useCallback(
    (next: LifeProfile) => {
      setProfile(next);
      markDirty();
    },
    [markDirty],
  );

  const handleRelationshipsChange = useCallback(
    (next: Relationship[]) => {
      setRelationships(next);
      markDirty();
    },
    [markDirty],
  );

  const handleGoalsChange = useCallback(
    (next: Goal[]) => {
      setGoals(next);
      markDirty();
    },
    [markDirty],
  );

  const handleSave = useCallback(async () => {
    if (!profile || !profileId) {
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          profile,
          relationships,
          goals,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save dashboard');
      }

      const data = (await response.json()) as DashboardResponse;
      setProfileId(data.profileId);
      setProfile(data.profile);
      setRelationships(data.relationships ?? []);
      setGoals(data.goals ?? []);
      setIsDirty(false);
      setLastSavedAt(new Date());
      setError(null);
    } catch (saveError) {
      console.error(saveError);
      setError('データの保存に失敗しました。通信環境をご確認ください。');
    } finally {
      setSaving(false);
    }
  }, [goals, profile, profileId, relationships]);

  const saveButtonLabel = useMemo(() => {
    if (saving) {
      return '保存中...';
    }
    if (!isDirty) {
      return '保存済み';
    }
    return '変更を保存';
  }, [isDirty, saving]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-10 sm:pt-12 md:px-8">
        <header className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">HITO LOG</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-[2rem] md:text-4xl">
                人生の時間を「見える化」し、<br className="hidden sm:block" />誰と何に投資するかを設計する
              </h1>
              <p className="mt-4 max-w-3xl text-sm text-slate-300 sm:text-base">
                ライフカウントダウン・人間関係・目標の 3 つの軸から、残り時間を定量化するプロトタイプです。
                まずは入力を編集し、今の自分の時間感覚を確かめてみましょう。
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>{isDirty ? '保存が必要です' : '最新の状態です'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {lastSavedAt && (
                  <span className="text-xs text-slate-400">
                    最終保存: {lastSavedAt.toLocaleString('ja-JP')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loading || !isDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-900 shadow hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
                >
                  {saveButtonLabel}
                </button>
              </div>
            </div>
          </div>
          <ul className="mt-6 grid gap-4 text-sm text-slate-200 sm:grid-cols-2 md:grid-cols-3">
            <li className="rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="font-semibold text-emerald-300">01.</span> 人生の残り時間をリアルタイムに把握
            </li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="font-semibold text-sky-300">02.</span> 大切な人との共有時間を試算
            </li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="font-semibold text-amber-300">03.</span> 目標達成に必要なペースを確認
            </li>
          </ul>
          {error && (
            <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
              {error}
            </p>
          )}
        </header>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
            データを読み込んでいます...
          </div>
        )}

        {!loading && profile && (
          <>
            <LifeCountdown profile={profile} onProfileChange={handleProfileChange} />

            <RelationshipPlanner
              selfProfile={profile}
              relationships={relationships}
              onRelationshipsChange={handleRelationshipsChange}
            />

            <GoalTracker goals={goals} onGoalsChange={handleGoalsChange} />
          </>
        )}
      </div>
    </main>
  );
}
