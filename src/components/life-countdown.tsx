'use client';

import { useEffect, useMemo, useState } from 'react';

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

  const handleFieldChange = <K extends keyof LifeProfile>(field: K, value: LifeProfile[K]) => {
    onProfileChange({ ...profile, [field]: value });
  };

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 text-slate-100 shadow-xl">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">人生カウントダウン</h2>
          <p className="text-sm text-slate-300">
            平均寿命に対する経過時間と残り時間をリアルタイムに表示します。
          </p>
        </div>
        <div className="text-right text-sm text-emerald-300">
          消化率 {formatPercentage(overview.progress)}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
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
          <div>
            <p className="text-xs text-slate-400">現在の年齢</p>
            <p className="text-2xl font-semibold text-white">
              {overview.ageYears.toFixed(2)} <span className="text-sm text-slate-400">歳</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">経過時間</p>
            <p className="text-sm text-slate-200">{formatDuration(overview.elapsedSeconds)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">残り時間</p>
            <p className="text-lg font-semibold text-emerald-300">
              {formatDuration(overview.remainingSeconds)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
