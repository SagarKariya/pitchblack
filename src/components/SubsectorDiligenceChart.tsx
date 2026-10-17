import React, { useState } from 'react';
import { SubsectorCheckItem } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { Layers, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Activity } from 'lucide-react';

interface SubsectorDiligenceChartProps {
  checks: SubsectorCheckItem[];
  sectorName: string;
  onSelectCheck?: (checkIndex: number) => void;
}

export const SubsectorDiligenceChart: React.FC<SubsectorDiligenceChartProps> = ({
  checks,
  sectorName,
  onSelectCheck,
}) => {
  const [chartType, setChartType] = useState<'radar' | 'bars'>('radar');

  // Compute scores and metrics for each check
  const data = checks.map((c, idx) => {
    let score = 50;
    let color = '#2563eb';
    let statusLabel = 'Material Flag';

    if (c.status === 'PASS') {
      score = 92;
      color = '#059669';
      statusLabel = 'Audit Passed';
    } else if (c.status === 'FLAG') {
      score = 62;
      color = '#2563eb';
      statusLabel = 'Material Flag';
    } else {
      score = 30;
      color = '#e11d48';
      statusLabel = 'Critical Fail';
    }

    // Short label for radar/bar axes
    const shortLabel = c.pillar.length > 22 ? c.pillar.substring(0, 20) + '...' : c.pillar;

    return {
      index: idx,
      fullPillar: c.pillar,
      shortLabel,
      score,
      targetHurdle: 85,
      status: c.status,
      statusLabel,
      metricValue: c.metricValue,
      targetBenchmark: c.targetBenchmark,
      color,
    };
  });

  const passCount = checks.filter((c) => c.status === 'PASS').length;
  const flagCount = checks.filter((c) => c.status === 'FLAG').length;
  const failCount = checks.filter((c) => c.status === 'FAIL').length;
  const averageScore = Math.round(data.reduce((sum, d) => sum + d.score, 0) / (data.length || 1));

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-zinc-900 font-sans tracking-tight">
              Vertical Diligence Alignment & Compliance Radar
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit compliance across {sectorName} operational pillars vs VC institutional standards.
          </p>
        </div>

        {/* Chart View Toggle & Health Score Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs">
            <span className="text-zinc-500 font-medium">Vertical Health:</span>
            <span
              className={`font-bold tabular-nums ${
                averageScore >= 80
                  ? 'text-emerald-700'
                  : averageScore >= 60
                  ? 'text-blue-700'
                  : 'text-rose-700'
              }`}
            >
              {averageScore} / 100
            </span>
          </div>

          <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/80">
            <button
              type="button"
              onClick={() => setChartType('radar')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartType === 'radar'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Radar Alignment
            </button>
            <button
              type="button"
              onClick={() => setChartType('bars')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartType === 'bars'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Pillar Scores
            </button>
          </div>
        </div>
      </div>

      {/* Visual Chart & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Main Chart Area */}
        <div className="lg:col-span-7 h-72 w-full bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-3 flex flex-col justify-center">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'radar' ? (
              <RadarChart data={data} outerRadius="72%">
                <PolarGrid stroke="#e4e4e7" strokeOpacity={0.8} />
                <PolarAngleAxis dataKey="shortLabel" stroke="#52525b" fontSize={10} tickLine={false} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#a1a1aa" fontSize={9} angle={30} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-lg text-xs space-y-1.5 max-w-xs">
                          <div className="font-bold text-zinc-900 border-b border-zinc-100 pb-1">
                            {d.fullPillar}
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-zinc-500">Compliance Score:</span>
                            <strong className="text-zinc-900">{d.score} / 100</strong>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-zinc-500">Status:</span>
                            <span
                              className={`font-bold ${
                                d.status === 'PASS'
                                  ? 'text-emerald-700'
                                  : d.status === 'FLAG'
                                  ? 'text-blue-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {d.statusLabel}
                            </span>
                          </div>
                          <div className="text-[11px] pt-1 border-t border-zinc-100 text-zinc-600">
                            <strong>Observed:</strong> {d.metricValue}
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            <strong>Target:</strong> {d.targetBenchmark}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Radar
                  name="Company Audit Score"
                  dataKey="score"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Radar
                  name="VC Hurdle Threshold"
                  dataKey="targetHurdle"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.12}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              </RadarChart>
            ) : (
              <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.7} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" fontSize={11} unit="%" />
                <YAxis
                  type="category"
                  dataKey="shortLabel"
                  stroke="#3f3f46"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-lg text-xs space-y-1 max-w-xs">
                          <span className="font-bold text-zinc-900 block">{d.fullPillar}</span>
                          <div className="text-zinc-600 flex justify-between gap-4">
                            <span>Audit Score:</span>
                            <strong className="text-zinc-900">{d.score}%</strong>
                          </div>
                          <div className="text-[11px] pt-1 border-t border-zinc-100 text-zinc-500">
                            Observed: {d.metricValue}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={85} stroke="#059669" strokeDasharray="3 3" label={{ value: 'VC Hurdle (85%)', fill: '#059669', fontSize: 10 }} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                  {data.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Right Column: Breakdown & Pillar Status Meters */}
        <div className="lg:col-span-5 space-y-3">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase">Passed</div>
              <div className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-0.5">
                {passCount}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">Standards Met</div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-blue-800 uppercase">Flagged</div>
              <div className="text-2xl font-extrabold text-blue-700 tabular-nums mt-0.5">
                {flagCount}
              </div>
              <div className="text-[10px] text-blue-600 font-medium">Audit Warning</div>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-rose-800 uppercase">Failed</div>
              <div className="text-2xl font-extrabold text-rose-700 tabular-nums mt-0.5">
                {failCount}
              </div>
              <div className="text-[10px] text-rose-600 font-medium">Critical Breach</div>
            </div>
          </div>

          {/* Quick List with Interactive Click */}
          <div className="space-y-2 pt-1">
            {checks.map((check, idx) => {
              const d = data[idx];
              return (
                <div
                  key={idx}
                  onClick={() => onSelectCheck && onSelectCheck(idx)}
                  className="bg-white border border-zinc-200/80 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer shadow-2xs text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {check.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : check.status === 'FLAG' ? (
                      <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-semibold text-zinc-900 truncate">
                      {check.pillar}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 bg-zinc-200 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${d.score}%`, backgroundColor: d.color }}
                      />
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        check.status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-800'
                          : check.status === 'FLAG'
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {d.score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
