'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Relationship, LifeProfile } from '../types/planner';
import { calculateRelationshipProjection } from '../lib/relationships';
import { formatDuration } from '../lib/time';

interface RelationshipPlannerProps {
  selfProfile: LifeProfile;
  relationships: Relationship[];
  onRelationshipsChange: (next: Relationship[]) => void;
}

const EMPTY_RELATIONSHIP: Omit<Relationship, 'id'> = {
  name: '',
  birthDate: '1990-01-01',
  lifeExpectancyYears: 85,
  meetingIntervalDays: 7,
  averageSessionMinutes: 120,
};

export function RelationshipPlanner({
  selfProfile,
  relationships,
  onRelationshipsChange,
}: RelationshipPlannerProps) {
  const [form, setForm] = useState(EMPTY_RELATIONSHIP);

  const projections = useMemo(
    () => relationships.map((relationship) => calculateRelationshipProjection(selfProfile, relationship)),
    [relationships, selfProfile],
  );

  const chartData = useMemo(
    () =>
      projections.map((projection) => ({
        id: projection.relationship.id,
        name: projection.relationship.name,
        sharedHours: Number(projection.totalSharedHours.toFixed(1)),
        remainingMeetings: projection.remainingMeetings,
      })),
    [projections],
  );

  const resetForm = () => setForm(EMPTY_RELATIONSHIP);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newRelationship: Relationship = {
      id: crypto.randomUUID(),
      ...form,
    };
    onRelationshipsChange([...relationships, newRelationship]);
    resetForm();
  };

  const handleRemove = (id: string) => {
    onRelationshipsChange(relationships.filter((relationship) => relationship.id !== id));
  };

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-950/90 p-5 text-slate-100 shadow-lg sm:p-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold">人間関係の時間共有</h2>
        <p className="text-sm text-slate-300">
          会える頻度とセッション時間を入力すると、残り会合回数と共有時間を試算します。
        </p>
      </header>

      <form className="grid gap-4 rounded-xl border border-white/5 bg-white/5 p-4" onSubmit={handleSubmit}>
        <h3 className="text-sm font-semibold text-slate-200">関係を追加</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-slate-400">名前</span>
            <input
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={form.name}
              required
              onChange={(event) => updateField('name', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-slate-400">生年月日</span>
            <input
              type="date"
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={form.birthDate}
              onChange={(event) => updateField('birthDate', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-slate-400">想定寿命（年）</span>
            <input
              type="number"
              min={1}
              step={0.5}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={form.lifeExpectancyYears}
              onChange={(event) => updateField('lifeExpectancyYears', Number(event.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-slate-400">会う間隔（日）</span>
            <input
              type="number"
              min={1}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={form.meetingIntervalDays}
              onChange={(event) => updateField('meetingIntervalDays', Number(event.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-slate-400">平均セッション（分）</span>
            <input
              type="number"
              min={1}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              value={form.averageSessionMinutes}
              onChange={(event) => updateField('averageSessionMinutes', Number(event.target.value))}
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
          >
            追加する
          </button>
        </div>
      </form>

      {chartData.length > 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">共有時間と残り会合の可視化</h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="shared-hours" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={{ stroke: 'rgba(148, 163, 184, 0.4)' }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.4)' }}
                  label={{ value: '共有時間 (時間)', angle: -90, position: 'insideLeft', fill: '#94a3b8', offset: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.4)' }}
                  label={{ value: '残り会合回数', angle: 90, position: 'insideRight', fill: '#94a3b8', offset: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: 12,
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#e2e8f0',
                  }}
                  formatter={(value: number | string, name: string) => {
                    const numericValue = typeof value === 'number' ? value : Number(value);
                    if (Number.isNaN(numericValue)) {
                      return [value, name];
                    }

                    return name === 'sharedHours'
                      ? [`${numericValue.toLocaleString()} 時間`, '共有時間']
                      : [`${Math.round(numericValue).toLocaleString()} 回`, '残り会合'];
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => (value === 'sharedHours' ? '共有時間 (h)' : '残り会合 (回)')}
                />
                <Bar yAxisId="left" dataKey="sharedHours" fill="url(#shared-hours)" radius={[12, 12, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="remainingMeetings" stroke="#fbbf24" strokeWidth={2} dot />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          登録された関係に基づく可視化は、データが追加されると表示されます。
        </p>
      )}

      {projections.length > 0 && (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-white/5 md:block">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">名前</th>
                  <th className="px-4 py-3">残り時間</th>
                  <th className="px-4 py-3">残り会合回数</th>
                  <th className="px-4 py-3">共有予定時間</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projections.map((projection) => (
                  <tr key={projection.relationship.id} className="bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{projection.relationship.name}</div>
                      <div className="text-xs text-slate-400">
                        年齢 {projection.otherOverview.ageYears.toFixed(1)} 歳
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {formatDuration(projection.pairRemainingSeconds)}
                    </td>
                    <td className="px-4 py-3 text-slate-200">{projection.remainingMeetings.toLocaleString()} 回</td>
                    <td className="px-4 py-3 text-slate-200">{projection.totalSharedHours.toFixed(1)} 時間</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="rounded-md border border-white/20 px-3 py-1 text-xs text-slate-200 hover:border-red-400 hover:text-red-300"
                        onClick={() => handleRemove(projection.relationship.id)}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {projections.map((projection) => (
              <article key={projection.relationship.id} className="space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-white">{projection.relationship.name}</h4>
                    <p className="text-xs text-slate-400">年齢 {projection.otherOverview.ageYears.toFixed(1)} 歳</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-white/20 px-2 py-1 text-[11px] text-slate-200 hover:border-red-400 hover:text-red-300"
                    onClick={() => handleRemove(projection.relationship.id)}
                  >
                    削除
                  </button>
                </div>
                <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                  <div className="rounded-lg bg-white/5 p-3">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-400">残り時間</dt>
                    <dd className="mt-1 font-semibold text-slate-100">{formatDuration(projection.pairRemainingSeconds)}</dd>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-400">残り会合</dt>
                    <dd className="mt-1 font-semibold text-slate-100">{projection.remainingMeetings.toLocaleString()} 回</dd>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-400">共有予定時間</dt>
                    <dd className="mt-1 font-semibold text-slate-100">{projection.totalSharedHours.toFixed(1)} 時間</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
