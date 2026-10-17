import React, { useState } from 'react';
import { FullDiligenceReport } from '../types';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Filter,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';

interface ScorecardRadarPillarProps {
  report: FullDiligenceReport;
}

export const ScorecardRadarPillar: React.FC<ScorecardRadarPillarProps> = ({ report }) => {
  const { signal, companyName, stage, sector } = report;
  const [filterType, setFilterType] = useState<'all' | 'top' | 'cleared' | 'under'>('all');

  const scorecard = signal.scorecard || {
    founderTeam: {
      score: 7.8,
      max: 10,
      title: 'Founder Team & Track Record',
      notes: 'Domain velocity is proven, but executive bench needs experienced VP of Sales.',
    },
    marketTam: {
      score: 8.5,
      max: 10,
      title: 'Market TAM & Secular Tailwinds',
      notes: 'Operating in a rapidly transitioning vertical with substantial greenfield spend.',
    },
    productMoat: {
      score: 6.4,
      max: 10,
      title: 'Product Defensibility & Moat',
      notes: 'Workflow integration active; proprietary data lock-in needs hardening.',
    },
    unitEconomics: {
      score: 5.6,
      max: 10,
      title: 'Unit Economics & Margin Rigor',
      notes: 'Reported economics mask true unblended CAC and underlying compute COGS.',
    },
    diligenceRisk: {
      score: 5.2,
      max: 10,
      title: 'Diligence Integrity & Cap Table',
      notes: 'Implied runway requires disciplined capital allocation and verification of ESOP pool.',
    },
  };

  const scorecardItems = [
    {
      factor: 'Founder & Team',
      score: scorecard.founderTeam?.score ?? 7.5,
      benchmark: 8.5,
      minHurdle: 6.5,
      fullMark: 10,
      title: scorecard.founderTeam?.title || 'Founder Team & Execution Cadence',
      notes: scorecard.founderTeam?.notes || 'Track record shows strong product velocity; GTM executive hires required.',
      icAction: 'Verify references with former seed leads; structure key-person retention lockup.',
    },
    {
      factor: 'Market & TAM',
      score: scorecard.marketTam?.score ?? 8.0,
      benchmark: 8.0,
      minHurdle: 6.0,
      fullMark: 10,
      title: scorecard.marketTam?.title || 'Market TAM & Secular Tailwinds',
      notes: scorecard.marketTam?.notes || 'Operating in high-velocity category with expansion into enterprise segments.',
      icAction: 'Conduct top-down vs bottom-up serviceable obtainable market reconciliation.',
    },
    {
      factor: 'Product Moat',
      score: scorecard.productMoat?.score ?? 6.5,
      benchmark: 8.0,
      minHurdle: 6.0,
      fullMark: 10,
      title: scorecard.productMoat?.title || 'Product Defensibility & Switching Costs',
      notes: scorecard.productMoat?.notes || 'High API embed stickiness; audit data ownership clauses with early design partners.',
      icAction: 'Review patent filings, copyright claims, and third-party foundation model licensing exposure.',
    },
    {
      factor: 'Unit Economics',
      score: scorecard.unitEconomics?.score ?? 6.0,
      benchmark: 8.0,
      minHurdle: 6.0,
      fullMark: 10,
      title: scorecard.unitEconomics?.title || 'Unit Economics & Margin Rigor',
      notes: scorecard.unitEconomics?.notes || 'Gross margins healthy on paper; dissect compute host costs and customer onboarding burden.',
      icAction: 'Reconcile customer-level gross margins and payback period on fully loaded unblended CAC.',
    },
    {
      factor: 'Cap Table & Risk',
      score: scorecard.diligenceRisk?.score ?? 5.5,
      benchmark: 8.5,
      minHurdle: 6.5,
      fullMark: 10,
      title: scorecard.diligenceRisk?.title || 'Diligence Risk & Cap Table Integrity',
      notes: scorecard.diligenceRisk?.notes || 'Unallocated ESOP pool must be expanded to 12% prior to closing financing round.',
      icAction: 'Audit liquidation preference stacks, warrants, and safe debt maturity schedules.',
    },
  ];

  const averageScore = Number(
    (scorecardItems.reduce((acc, curr) => acc + curr.score, 0) / scorecardItems.length).toFixed(1)
  );

  const topTierCount = scorecardItems.filter((i) => i.score >= i.benchmark).length;
  const clearedCount = scorecardItems.filter((i) => i.score >= i.minHurdle).length;
  const underHurdleCount = scorecardItems.filter((i) => i.score < i.minHurdle).length;

  const filteredItems = scorecardItems.filter((item) => {
    if (filterType === 'top') return item.score >= item.benchmark;
    if (filterType === 'cleared') return item.score >= item.minHurdle;
    if (filterType === 'under') return item.score < item.minHurdle;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Pillar 02 Banner Header - Institutional Visual Similarity */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                Pillar 02 · 5-Factor Diligence Scorecard
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-3xl leading-relaxed">
              Multi-axial risk evaluation and standardized partner assessment across the 5 core VC decision vectors, weighted against top-quartile fund returners and minimum investment committee hurdles for {stage} {sector.replace('_', ' ')} companies.
            </p>
          </div>

          {/* Aggregate Conviction Dial */}
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 px-5 py-3 rounded-xl self-start md:self-auto shrink-0 shadow-xs">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Scorecard Average</div>
              <div className="text-[11px] text-zinc-400">Scale 0 – 10.0</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold tabular-nums text-zinc-900 tracking-tight">
                {averageScore}
              </span>
              <span className="text-sm tabular-nums text-zinc-400 font-bold">/10</span>
            </div>
          </div>
        </div>

        {/* 4 Quick Institutional Vitals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-100">
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Overall Score</span>
            <div className="text-lg font-bold text-zinc-900 mt-0.5 flex items-center gap-1.5">
              <span>{averageScore} / 10</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                Weighted
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Top-quartile hurdle: 8.0</span>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Hurdles Cleared</span>
            <div className="text-lg font-bold text-zinc-900 mt-0.5 flex items-center gap-1.5">
              <span>{clearedCount} of 5</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">
                {clearedCount >= 4 ? 'Solid' : 'Warning'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Min barrier: ≥ 6.0 - 6.5</span>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Top-Tier Outliers</span>
            <div className="text-lg font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
              <span>{topTierCount} Vectors</span>
              <Award className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-[10px] text-zinc-400 block mt-0.5">≥ 8.0 institutional target</span>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Under-Hurdle Gaps</span>
            <div className="text-lg font-bold text-rose-600 mt-0.5 flex items-center gap-1.5">
              <span>{underHurdleCount} Vectors</span>
              {underHurdleCount > 0 ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">
                  Action Req
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                  Clean
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Require IC confirmatory audit</span>
          </div>
        </div>
      </div>

      {/* Filter and View Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-zinc-200/90 rounded-2xl p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All 5 Vectors ({scorecardItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('top')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'top'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Top Tier ({topTierCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('cleared')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'cleared'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Hurdle Cleared ({clearedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('under')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'under'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Under Hurdle ({underHurdleCount})
          </button>
        </div>

        <div className="text-[11px] text-zinc-500 font-medium px-3 hidden md:flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-zinc-400" />
          <span>Click vectors to filter committee focus areas</span>
        </div>
      </div>

      {/* Main Scorecard Layout: Left Radar Chart & Overlay, Right Granular Factor Cards */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Radar Chart & Institutional Legend */}
          <div className="lg:col-span-5 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="w-full flex items-center justify-between px-1 mb-2 text-xs">
                <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  Conviction Radar Profile
                </span>
                <span className="text-zinc-500 text-[11px]">3-Tier Benchmark Overlay</span>
              </div>

              <div className="w-full h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={scorecardItems} margin={{ top: 10, right: 28, bottom: 10, left: 28 }}>
                    <PolarGrid stroke="#e4e4e7" strokeOpacity={0.8} />
                    <PolarAngleAxis dataKey="factor" stroke="#52525b" fontSize={11} tickLine={false} />
                    <PolarRadiusAxis domain={[0, 10]} stroke="#a1a1aa" fontSize={10} angle={30} tickCount={6} />
                    <Radar
                      name="Company Score"
                      dataKey="score"
                      stroke="#059669"
                      fill="#10b981"
                      fillOpacity={0.35}
                      strokeWidth={2.5}
                    />
                    <Radar
                      name="Top-Quartile Target"
                      dataKey="benchmark"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.12}
                      strokeWidth={1.5}
                    />
                    <Radar
                      name="Minimum Hurdle"
                      dataKey="minHurdle"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.05}
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xl text-xs space-y-1">
                              <strong className="text-zinc-900 block border-b border-zinc-100 pb-1">
                                {d.title}
                              </strong>
                              <div className="flex justify-between gap-5 text-emerald-700">
                                <span>Company Score:</span>
                                <strong>{d.score} / 10</strong>
                              </div>
                              <div className="flex justify-between gap-5 text-blue-700">
                                <span>Top-Quartile Target:</span>
                                <strong>{d.benchmark} / 10</strong>
                              </div>
                              <div className="flex justify-between gap-5 text-rose-600">
                                <span>Minimum Hurdle:</span>
                                <strong>{d.minHurdle} / 10</strong>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full space-y-2 mt-2">
              <div className="w-full pt-2.5 border-t border-zinc-200/70 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
                  🟢 Company ({averageScore}/10)
                </div>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-200/60">
                  🔵 Top Quartile (8.2/10)
                </div>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-800 font-semibold border border-rose-200/60">
                  🔴 Min Hurdle (6.2/10)
                </div>
              </div>

              {/* Quick Audit Note */}
              <div className="w-full p-2.5 bg-zinc-100/80 rounded-xl border border-zinc-200/60 text-[11px] text-zinc-600 leading-snug">
                <span className="font-bold text-zinc-800 mr-1">IC Conviction Rule:</span>
                Deals with 2+ vectors under minimum hurdles require explicit unanimous sponsor approval before preliminary term sheet issuance.
              </div>
            </div>
          </div>

          {/* Right Column: Factor Cards (Compressed & Height-Balanced) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-2 h-full">
            {filteredItems.map((item, idx) => {
              const scorePct = (item.score / item.fullMark) * 100;
              const isPassing = item.score >= item.minHurdle;
              const isTopTier = item.score >= item.benchmark;

              return (
                <div
                  key={item.factor}
                  className="bg-zinc-50/70 border border-zinc-200/80 rounded-xl p-3 sm:p-3.5 hover:bg-white hover:border-zinc-300 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-zinc-200 text-zinc-700 text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                        0{idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-medium shrink-0 hidden sm:inline">
                        ({item.factor})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isTopTier
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isPassing
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {isTopTier ? 'Top Tier' : isPassing ? 'Hurdle Cleared' : 'Under Hurdle'}
                      </span>
                      <div className="text-xs sm:text-sm font-extrabold text-zinc-900 tabular-nums">
                        {item.score} <span className="text-[10px] text-zinc-400 font-normal">/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Combined Progress track + thresholds */}
                  <div className="flex items-center gap-3 my-1.5">
                    <div className="flex-1 bg-zinc-200 h-1.5 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isTopTier ? 'bg-emerald-500' : isPassing ? 'bg-blue-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium shrink-0">
                      <span>Hurdle: <strong className="text-zinc-700">{item.minHurdle}</strong></span>
                      <span className="text-zinc-300">•</span>
                      <span>Target: <strong className="text-zinc-700">{item.benchmark}</strong></span>
                      <span className="text-zinc-300">•</span>
                      <span className={item.score >= item.minHurdle ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                        {item.score >= item.minHurdle ? '+' : ''}{(item.score - item.minHurdle).toFixed(1)} pts
                      </span>
                    </div>
                  </div>

                  {/* Diligence Analysis */}
                  <p className="text-[11px] sm:text-xs text-zinc-600 leading-snug line-clamp-2">
                    {item.notes}
                  </p>

                  {/* Investment Committee Action Directive */}
                  <div className="mt-1.5 px-2 py-1 bg-white/90 border border-zinc-200/80 rounded-md flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-700">
                    <ChevronRight className="w-3 h-3 text-blue-600 shrink-0" />
                    <strong className="text-zinc-900 shrink-0">IC Action:</strong>
                    <span className="truncate">{item.icAction}</span>
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
