import React from 'react';
import { FullDiligenceReport } from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Flame,
  Target,
  Sparkles,
} from 'lucide-react';
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
} from 'recharts';

interface SignalPillarProps {
  report: FullDiligenceReport;
}

export const SignalPillar: React.FC<SignalPillarProps> = ({ report }) => {
  const { signal, baseline, companyName, stage, targetRaise, valuationClaim, sector } = report;

  const signalConfig = {
    HIGH_CONVICTION: {
      cardBorder: 'border-emerald-500/50 shadow-emerald-500/10',
      badgeBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-bold',
      iconColor: 'text-emerald-600',
      icon: CheckCircle2,
      label: 'HIGH CONVICTION · PROCEED TO PARTNER MEETING',
    },
    CONDITIONAL: {
      cardBorder: 'border-blue-500/50 shadow-blue-500/10',
      badgeBg: 'bg-blue-500/10 text-blue-700 border-blue-500/30 font-bold',
      iconColor: 'text-blue-600',
      icon: AlertTriangle,
      label: 'CONDITIONAL · DEEP DATA ROOM AUDIT REQUIRED',
    },
    REJECT_PASS: {
      cardBorder: 'border-rose-500/50 shadow-rose-500/10',
      badgeBg: 'bg-rose-500/10 text-rose-700 border-rose-500/30 font-bold',
      iconColor: 'text-rose-600',
      icon: XCircle,
      label: 'PASS / REJECT · MATERIAL STRUCTURAL RISKS',
    },
  }[signal.signal];

  const IconComponent = signalConfig.icon;

  // Scenario Payoff & Return Multiple Waterfall
  const askValuation = baseline.valuationClaim || 45;
  const scenarioData = [
    {
      scenario: 'Bear Case',
      moic: 0.6,
      exitValuation: Math.round(askValuation * 0.6),
      probability: '25%',
      color: '#ef4444',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      label: 'Cap Impairment / Fire Sale',
      summary: signal.bearCase,
    },
    {
      scenario: 'Base Case',
      moic: 2.8,
      exitValuation: Math.round(askValuation * 2.8),
      probability: '55%',
      color: '#2563eb',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      label: 'Base Pro-Rata Return',
      summary: signal.baseCase,
    },
    {
      scenario: 'Bull Case',
      moic: 8.5,
      exitValuation: Math.round(askValuation * 8.5),
      probability: '20%',
      color: '#10b981',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      label: 'Fund Returner Outlier (10x)',
      summary: signal.bullCase,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pillar 01 Banner Header - Institutional Visual Similarity */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                Pillar 01 · Investment Verdict
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-3xl leading-relaxed">
              Underwriting verdict and decision directives — institutional synthesis of all qualitative and forensic signals into an actionable Investment Committee verdict, return multiple payoff scenarios, and downside mitigations.
            </p>
          </div>
          {/* Shifted Conviction Score from card below */}
          <div className="flex items-center justify-between sm:justify-end gap-3 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl shadow-xs self-start md:self-auto shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Conviction Score</div>
              <div className="text-[10px] text-zinc-400">Benchmark Quantified</div>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-extrabold tabular-nums text-zinc-900 tracking-tight">
                {signal.convictionScore}
              </span>
              <span className="text-xs tabular-nums text-zinc-400">/100</span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics Strip: Deal Snapshot (8-Card Institutional Financial Vitals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-5 pt-5 border-t border-zinc-100">
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
              <Target className="w-3 h-3 text-zinc-400" /> Stage & Sector
            </div>
            <div className="mt-1 font-bold text-zinc-900 text-xs truncate">
              {stage} • {sector.replace('_', ' ')}
            </div>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-600" /> Current ARR
            </div>
            <div className="mt-1 font-extrabold text-emerald-600 tabular-nums text-sm">
              ${baseline.arr.toFixed(2)}M
            </div>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-blue-600" /> Cash in Bank
            </div>
            <div className="mt-1 font-extrabold text-blue-600 tabular-nums text-sm">
              ${(baseline.cashOnHand ?? (baseline.arr * 0.75)).toFixed(2)}M
            </div>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-500" /> Net Burn
            </div>
            <div className="mt-1 font-extrabold text-zinc-900 tabular-nums text-sm">
              ${Math.round(baseline.monthlyBurn * 1000)}k /mo
            </div>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-600" /> Runway
            </div>
            <div className="mt-1 font-extrabold text-zinc-900 tabular-nums text-sm">
              {baseline.runwayMonths} Mo
            </div>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-600" /> Gross Margin
            </div>
            <div className="mt-1 font-extrabold text-violet-700 tabular-nums text-sm">
              {baseline.grossMarginPct}%
            </div>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-600" /> Target Raise
            </div>
            <div className="mt-1 font-bold text-blue-600 tabular-nums text-xs truncate">
              {targetRaise}
            </div>
          </div>

          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-zinc-400" /> Valuation Ask
            </div>
            <div className="mt-1 font-bold text-zinc-900 tabular-nums text-xs truncate">
              {valuationClaim}
            </div>
          </div>
        </div>
      </div>

      {/* 3 INDIVIDUAL STRATEGIC DIRECTIVE CARDS */}
      <div className="grid md:grid-cols-3 gap-5 items-stretch">
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-start transition-all duration-200 hover:shadow-md h-full">
          <div className="pb-3 mb-3 border-b border-zinc-100 shrink-0">
            <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" /> Executive Verdict Summary
            </div>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-800 font-normal">
            {signal.verdictSummary}
          </p>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-start transition-all duration-200 hover:shadow-md h-full">
          <div className="pb-3 mb-3 border-b border-zinc-100 shrink-0">
            <div className="text-xs uppercase tracking-wider text-blue-700 font-semibold flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" /> Lead Partner Directive
            </div>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-800 font-normal">
            {signal.partnerDirective}
          </p>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-start transition-all duration-200 hover:shadow-md h-full">
          <div className="pb-3 mb-3 border-b border-zinc-100 shrink-0">
            <div className="text-xs uppercase tracking-wider text-violet-700 font-semibold flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-600 shrink-0" /> Upside Thesis & Moat Catalysts
            </div>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-800 font-normal">
            {signal.bullCase || "High expansion leverage via enterprise accounts and structural switching moats."}
          </p>
        </div>
      </div>

      {/* SECTION 2: SCENARIO RETURNS & PAYOFF WATERFALL CHART (STANDALONE CLEAN CARD) */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-zinc-900 font-sans tracking-tight">
                  Investment Returns & Multiple on Invested Capital (MOIC) Payoff
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Modeled exit returns across Bear, Base, and Bull scenarios at ${askValuation}M entry valuation.
              </p>
            </div>
          </div>

          {/* Visual Chart for Scenarios */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-5 h-56 w-full bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scenarioData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.7} vertical={false} />
                  <XAxis dataKey="scenario" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="x" domain={[0, 10]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-lg text-xs space-y-1">
                            <span className="font-bold text-zinc-900 block">{d.scenario}</span>
                            <div className="text-zinc-600 flex justify-between gap-4">
                              <span>Target MOIC:</span>
                              <strong className="text-zinc-900">{d.moic}x Multiple</strong>
                            </div>
                            <div className="text-zinc-600 flex justify-between gap-4">
                              <span>Implied Exit:</span>
                              <strong className="text-emerald-700">${d.exitValuation}M</strong>
                            </div>
                            <div className="text-zinc-500 text-[10px] pt-1 border-t border-zinc-100">
                              Probability: {d.probability} · {d.label}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={1.0} stroke="#71717a" strokeDasharray="3 3" label={{ value: '1.0x Par', fill: '#71717a', fontSize: 10 }} />
                  <ReferenceLine y={3.0} stroke="#2563eb" strokeDasharray="3 3" label={{ value: '3.0x Target', fill: '#2563eb', fontSize: 10 }} />
                  <Bar dataKey="moic" name="Target MOIC (x)" radius={[6, 6, 0, 0]} barSize={36}>
                    {scenarioData.map((entry, index) => (
                      <Cell key={`scenario-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scenario Detail Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scenarioData.map((sc) => (
                <div
                  key={sc.scenario}
                  className="bg-white border border-zinc-200/90 rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">{sc.scenario}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sc.badgeClass}`}>
                        {sc.moic}x MOIC
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-zinc-900 tabular-nums mt-1">
                      ${sc.exitValuation}M
                      <span className="text-[10px] font-normal text-zinc-400 ml-1">Exit</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed mt-1 line-clamp-4">
                      {sc.summary}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 font-medium flex justify-between">
                    <span>Probability: {sc.probability}</span>
                    <span className="text-zinc-600">{sc.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};
