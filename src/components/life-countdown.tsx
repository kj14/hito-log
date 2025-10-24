'use client';

import { useEffect, useMemo, useState } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { LifeProfile } from '../types/planner';
import {
  LifeOverview,
  calculateLifeOverview,
  formatDuration,
  formatPercentage,
} from '../lib/time';

interface LifeCountdownProps {
  profile: LifeProfile;
  onProfileChange: (next: LifeProfile) => void;
}

export function LifeCountdown({ profile, onProfileChange }: LifeCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const overview: LifeOverview = useMemo(
    () => calculateLifeOverview(profile, new Date(now)),
    [profile, now],
  );

  const progressPercent = useMemo(() => {
    const raw = overview.progress * 100;
    const clamped = Math.min(100, Math.max(0, raw));
    return Number(clamped.toFixed(2));
  }, [overview.progress]);

  const chartData = useMemo(
    () => [
      {
        name: '経過',
        value: progressPercent,
      },
    ],
    [progressPercent],
  );

  const handleFieldChange = <K extends keyof LifeProfile>(field: K, value: LifeProfile[K]) => {
    onProfileChange({ ...profile, [field]: value });
  };

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 text-slate-100 shadow-xl sm:p-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">人生カウントダウン</h2>
          <p className="text-sm text-slate-300">
            平均寿命に対する経過時間と残り時間をリアルタイムに表示します。
          </p>
        </div>
        <div className="text-sm text-emerald-300 md:text-right">
          消化率 {formatPercentage(overview.progress)}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
        <div className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">名前</span>
            <input
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              value={profile.name}
              onChange={(event) => handleFieldChange('name', event.target.value)}
              placeholder="あなたの名前"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">生年月日</span>
            <input
              type="date"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              value={profile.birthDate}
              onChange={(event) => handleFieldChange('birthDate', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">想定平均寿命（年）</span>
            <input
              type="number"
              min={1}
              step={0.1}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              value={profile.lifeExpectancyYears}
              onChange={(event) =>
                handleFieldChange('lifeExpectancyYears', Number(event.target.value))
              }
            />
          </label>
        </div>
        <div className="grid gap-4 rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="relative flex h-56 items-center justify-center sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={chartData}
                innerRadius="65%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
              >
                <defs>
                  <linearGradient id="life-progress" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={40}
                  fill="url(#life-progress)"
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">消化率</p>
              <p className="text-3xl font-semibold text-white">{progressPercent.toFixed(1)}%</p>
              <p className="text-xs text-slate-400">残り {formatDuration(overview.remainingSeconds)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:text-base">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-slate-400">現在の年齢</p>
              <p className="text-lg font-semibold text-white">
                {overview.ageYears.toFixed(2)} <span className="text-xs text-slate-400">歳</span>
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-slate-400">経過時間</p>
              <p className="text-sm text-slate-200">{formatDuration(overview.elapsedSeconds)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
