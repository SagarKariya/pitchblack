import React from 'react';
import { FullDiligenceReport } from '../types';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface TrajectoryPillarProps {
  report: FullDiligenceReport;
}

export const TrajectoryPillar: React.FC<TrajectoryPillarProps> = ({ report }) => {
  const { historicalQuarters, cohortDecay, companyName, baseline } = report;

  // Calculate high-level summary metrics from quarters
  const latestQtr = historicalQuarters[historicalQuarters.length - 1];
  const earliestQtr = historicalQuarters[0];
  const totalLTMRev = historicalQuarters.reduce((acc, q) => acc + q.revenue, 0);
  const arrGrowthPct = earliestQtr && earliestQtr.arr > 0
    ? Math.round(((latestQtr.arr - earliestQtr.arr) / earliestQtr.arr) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Pillar 03 Banner Header - Institutional Visual Similarity */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
                Pillar 03 · Financial Trajectory
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-3xl leading-relaxed">
              Longitudinal verification of 4-quarter financials and 8-quarter cohort retention decay, assessing quarterly ARR expansion against operating cash burn, gross profit margins, and claimed NDR against institutional top-quartile SaaS standards.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl self-start md:self-auto shadow-xs shrink-0">
            <Calendar className="w-4 h-4 text-violet-600 shrink-0" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Audit Scope</div>
              <span className="text-xs font-bold text-zinc-900">4 Quarters · 8 Cohort Epochs</span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-100">
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Current ARR Run-Rate</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums flex items-baseline gap-1">
              ${latestQtr?.arr || baseline.arr}M
              <span className="text-[10px] font-semibold text-emerald-700">+{arrGrowthPct}% YoY</span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">LTM Revenue Recognized</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums">
              ${totalLTMRev.toFixed(1)}M
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Latest Net Burn</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums">
              ${latestQtr?.netBurn || baseline.monthlyBurn * 3}M / qtr
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Claimed vs Real NDR</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              <span className="text-blue-700">{cohortDecay[cohortDecay.length - 1]?.reported}%</span>
              <span className="text-zinc-400 font-normal text-xs">vs</span>
              <span className="text-zinc-900">{cohortDecay[cohortDecay.length - 1]?.underlyingReal}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Cards Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 1: 4-Quarter Revenue, ARR & Burn Trajectory */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-bold text-zinc-900 font-sans">
                    4-Quarter Financial Performance ($ Millions)
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Trajectory of ARR growth vs Quarterly Operating Burn & Gross Profit.
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 shrink-0">
                Financial Run-Rate
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalQuarters} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.7} vertical={false} />
                  <XAxis dataKey="quarter" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#09090b',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar dataKey="arr" name="Ending ARR ($M)" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Quarterly Rev ($M)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="grossProfit" name="Gross Profit ($M)" fill="#18181b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netBurn" name="Net Burn ($M)" fill="#71717a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-3 text-[11px] text-zinc-600">
            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
              <strong className="text-zinc-900 block font-semibold">ARR Growth Pace:</strong>
              Expanded from ${earliestQtr?.arr}M to ${latestQtr?.arr}M over 4 tracked operating quarters.
            </div>
            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
              <strong className="text-zinc-900 block font-semibold">Burn Efficiency:</strong>
              Operating burn reflects disciplined unit margin discipline as gross profit scales.
            </div>
          </div>
        </div>

        {/* Chart 2: Cohort Decay Waterfall */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-bold text-zinc-900 font-sans">
                    8-Quarter Retention & Cohort Decay Waterfall (%)
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Audit comparing reported expansion vs top-quartile vs underlying mature retention.
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 shrink-0">
                Retention Audit
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cohortDecay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.7} vertical={false} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                  <YAxis domain={[60, 150]} stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#09090b',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                    formatter={(val: any) => [`${val}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="reported"
                    name="Claimed NDR Curve"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="topQuartileBenchmark"
                    name="Top-Quartile SaaS (>125%)"
                    stroke="#059669"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="underlyingReal"
                    name="Audited Underlying Real Decay"
                    stroke="#18181b"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-3 text-[11px] text-zinc-600">
            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
              <strong className="text-zinc-900 block font-semibold">Cohort Inflection:</strong>
              Real retention curve stabilizes around month 12 to 18, revealing true customer half-life.
            </div>
            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
              <strong className="text-zinc-900 block font-semibold">Diligence Warning:</strong>
              Watch for early cohort masking where rapid acquisition hides churn in older accounts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
