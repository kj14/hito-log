'use client';

import { useState } from 'react';

import { LifeCountdown } from '../components/life-countdown';
import { RelationshipPlanner } from '../components/relationship-planner';
import { GoalTracker } from '../components/goal-tracker';
import { Goal, LifeProfile, Relationship } from '../types/planner';

const DEFAULT_PROFILE: LifeProfile = {
  name: 'あなた',
  birthDate: '1990-01-01',
  lifeExpectancyYears: 84,
};

const INITIAL_RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel-1',
    name: '母',
    birthDate: '1965-05-12',
    lifeExpectancyYears: 88,
    meetingIntervalDays: 30,
    averageSessionMinutes: 180,
  },
  {
    id: 'rel-2',
    name: '親友',
    birthDate: '1991-09-02',
    lifeExpectancyYears: 84,
    meetingIntervalDays: 14,
    averageSessionMinutes: 120,
  },
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'TOEIC 900 点突破',
    category: '学習',
    targetEffortHours: 200,
    targetDate: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10),
    motivationNote: '海外クライアントとの商談を一人で担当できるようになる',
    logs: [
      {
        id: 'log-1',
        loggedAt: new Date().toISOString(),
        minutes: 45,
      },
      {
        id: 'log-2',
        loggedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        minutes: 30,
      },
    ],
  },
];

export default function Home() {
  const [profile, setProfile] = useState<LifeProfile>(DEFAULT_PROFILE);
  const [relationships, setRelationships] = useState<Relationship[]>(INITIAL_RELATIONSHIPS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-10 sm:pt-12 md:px-8">
        <header className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">HITO LOG</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-[2rem] md:text-4xl">
            人生の時間を「見える化」し、<br className="hidden sm:block" />誰と何に投資するかを設計する
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-300 sm:text-base">
            ライフカウントダウン・人間関係・目標の 3 つの軸から、残り時間を定量化するプロトタイプです。
            まずは入力を編集し、今の自分の時間感覚を確かめてみましょう。
          </p>
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
        </header>

        <LifeCountdown profile={profile} onProfileChange={setProfile} />

        <RelationshipPlanner
          selfProfile={profile}
          relationships={relationships}
          onRelationshipsChange={setRelationships}
        />

        <GoalTracker goals={goals} onGoalsChange={setGoals} />
      </div>
    </main>
  );
}
