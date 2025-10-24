'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Goal } from '../types/planner';
import { calculateGoalStats } from '../lib/goals';

interface GoalTrackerProps {
  goals: Goal[];
  onGoalsChange: (next: Goal[]) => void;
}

const EMPTY_GOAL: Omit<Goal, 'id' | 'logs'> = {
  title: '',
  targetEffortHours: 120,
  targetDate: new Date().toISOString().slice(0, 10),
  category: undefined,
  motivationNote: '',
};

type GoalTimelinePoint = {
  date: string;
  cumulativeHours: number;
};

function buildGoalTimeline(goal: Goal): GoalTimelinePoint[] {
  if (goal.logs.length === 0) {
    return [];
  }

  const groupedByDate = goal.logs.reduce<Record<string, number>>((acc, log) => {
    const dateKey = log.loggedAt.slice(0, 10);
    acc[dateKey] = (acc[dateKey] ?? 0) + log.minutes;
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => (a > b ? 1 : -1));
  let cumulativeMinutes = 0;

  return sortedDates.map((date) => {
    cumulativeMinutes += groupedByDate[date];
    return {
      date,
      cumulativeHours: Number((cumulativeMinutes / 60).toFixed(2)),
    };
  });
}

export function GoalTracker({ goals, onGoalsChange }: GoalTrackerProps) {
  const [form, setForm] = useState(EMPTY_GOAL);

  const statsList = useMemo(() => goals.map((goal) => ({ goal, stats: calculateGoalStats(goal) })), [goals]);

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => setForm(EMPTY_GOAL);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      logs: [],
      ...form,
    };
    onGoalsChange([...goals, newGoal]);
    resetForm();
  };

  const handleAddLog = (goalId: string, minutes: number) => {
    onGoalsChange(
      goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              logs: [
                ...goal.logs,
                {
                  id: crypto.randomUUID(),
                  loggedAt: new Date().toISOString(),
                  minutes,
                },
              ],
            }
          : goal,
      ),
    );
  };

  const handleRemoveGoal = (goalId: string) => {
    onGoalsChange(goals.filter((goal) => goal.id !== goalId));
  };

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-slate-100 shadow-lg sm:p-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold">目標達成トラッキング</h2>
        <p className="text-sm text-slate-300">
          必要な投入時間と現在のペースから、達成予定日を推測します。
        </p>
      </header>

      <form className="grid gap-4 rounded-xl border border-white/5 bg-white/5 p-4" onSubmit={handleSubmit}>
        <h3 className="text-sm font-semibold text-slate-200">目標を追加</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-slate-400">目標名</span>
            <input
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              value={form.title}
              required
              onChange={(event) => updateField('title', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-slate-400">カテゴリー</span>
            <input
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              value={form.category ?? ''}
              onChange={(event) => updateField('category', event.target.value || undefined)}
              placeholder="学習 / 健康 など"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-slate-400">必要時間（時間）</span>
            <input
              type="number"
              min={1}
              step={1}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              value={form.targetEffortHours}
              onChange={(event) => updateField('targetEffortHours', Number(event.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-slate-400">目標日</span>
            <input
              type="date"
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              value={form.targetDate}
              onChange={(event) => updateField('targetDate', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-3">
            <span className="text-xs uppercase tracking-wide text-slate-400">モチベーションメモ</span>
            <textarea
              rows={2}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              value={form.motivationNote}
              onChange={(event) => updateField('motivationNote', event.target.value)}
              placeholder="この目標を達成したい理由を記録しましょう"
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          >
            登録する
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {statsList.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
            目標がまだ登録されていません。達成したいことを追加してみましょう。
          </p>
        )}
        {statsList.map(({ goal, stats }) => {
          const timeline = buildGoalTimeline(goal);
          const maxLoggedHours = timeline.reduce(
            (max, point) => Math.max(max, point.cumulativeHours),
            0,
          );
          const yDomainMax = Math.max(goal.targetEffortHours, maxLoggedHours) * 1.1 || 1;

          return (
            <article key={goal.id} className="space-y-3 rounded-xl border border-white/10 bg-slate-950/80 p-4 sm:p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">{goal.title}</h3>
                  {goal.category && <p className="text-xs uppercase tracking-wide text-amber-300">{goal.category}</p>}
                  {goal.motivationNote && (
                    <p className="mt-2 text-sm text-slate-300">{goal.motivationNote}</p>
                  )}
                </div>
                <div className="text-sm text-slate-300 md:text-right">
                  目標日: {goal.targetDate}
                </div>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white/5 p-3">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">進捗率</dt>
                  <dd className="text-lg font-semibold text-amber-300">{(stats.progressRatio * 100).toFixed(1)}%</dd>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-400">残り時間</dt>
                <dd className="text-lg font-semibold text-white">{Math.max(0, Math.round(stats.remainingMinutes)).toLocaleString()} 分</dd>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-400">必要ペース</dt>
                <dd className="text-lg font-semibold text-white">{Math.ceil(stats.requiredDailyMinutes)} 分/日</dd>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-400">予測完了日</dt>
                <dd className="text-lg font-semibold text-white">
                  {stats.projectedCompletionDate
                    ? stats.projectedCompletionDate.toISOString().slice(0, 10)
                    : 'データ不足'}
                </dd>
                {stats.completionDeltaDays !== null && (
                  <p className="text-xs text-slate-300">
                    目標比 {stats.completionDeltaDays >= 0 ? '+' : ''}
                    {stats.completionDeltaDays} 日
                  </p>
                )}
              </div>
            </dl>

              <div className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
                <h4 className="text-xs uppercase tracking-wide text-slate-400">投資時間の推移</h4>
                {timeline.length > 0 ? (
                  <div className="mt-3 h-48 w-full sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`goal-${goal.id}-area`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(148, 163, 184, 0.4)' }}
                        tickFormatter={(value: string) => value.slice(5)}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(148, 163, 184, 0.4)' }}
                        width={60}
                        domain={[0, yDomainMax]}
                        tickFormatter={(value) => `${value.toFixed(0)}h`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          borderRadius: 12,
                          border: '1px solid rgba(148, 163, 184, 0.25)',
                          color: '#e2e8f0',
                        }}
                        formatter={(value: number | string) => {
                          const numericValue = typeof value === 'number' ? value : Number(value);
                          if (Number.isNaN(numericValue)) {
                            return [String(value), '累積投資'];
                          }
                          return [`${numericValue.toFixed(2)} 時間`, '累積投資'];
                        }}
                        labelFormatter={(value: string) => `日付: ${value}`}
                      />
                      <ReferenceLine
                        y={goal.targetEffortHours}
                        stroke="#38bdf8"
                        strokeDasharray="4 4"
                        label={{ value: '目標時間', position: 'insideTopRight', fill: '#38bdf8' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulativeHours"
                        stroke="#fbbf24"
                        strokeWidth={2}
                        fill={`url(#goal-${goal.id}-area)`}
                        dot={{ r: 3, strokeWidth: 1, stroke: '#fbbf24' }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">
                  実績ログが追加されると推移グラフが表示されます。
                </p>
              )}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-slate-400">
                  ログ数 {goal.logs.length} 件 / 実績合計 {Math.round(stats.totalLoggedMinutes)} 分
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-xs text-slate-300">今日のログを追加:</span>
                {[15, 30, 60].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className="rounded-full border border-amber-300/60 px-3 py-1 text-xs text-amber-200 transition hover:border-amber-200 hover:text-amber-100"
                    onClick={() => handleAddLog(goal.id, minutes)}
                  >
                    +{minutes}分
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 hover:border-red-400 hover:text-red-300"
                  onClick={() => handleRemoveGoal(goal.id)}
                >
                  削除
                </button>
              </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
