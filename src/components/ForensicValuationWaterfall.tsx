import React from 'react';
import { ForensicOmission } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { TrendingDown, Sliders, ShieldAlert } from 'lucide-react';

export interface ForensicValuationWaterfallProps {
  flags?: ForensicOmission[];
  claimedValuation: number; // e.g. 65 ($M)
  cacInflation?: number;
  salesCycleSlippage?: number;
  grossChurnSpike?: number;
  grossMarginDrop?: number;
  valuationHaircutPct?: number;
  neededCapitalFor18Mo?: number;
  onSelectFlag?: (flagId: string) => void;
  variant?: 'sensitivity' | 'forensic';
}

export const ForensicValuationWaterfall: React.FC<ForensicValuationWaterfallProps> = ({
  flags = [],
  claimedValuation = 65,
  cacInflation = 0,
  salesCycleSlippage = 0,
  grossChurnSpike = 0,
  grossMarginDrop = 0,
  neededCapitalFor18Mo,
  onSelectFlag,
  variant = 'sensitivity',
}) => {
  const isSensitivity = variant === 'sensitivity';
  let remainingVal = claimedValuation || 65;

  let deductions: Array<{
    id: string;
    name: string;
    fullName: string;
    type: 'deduction';
    value: number;
    displayVal: number;
    startVal: number;
    endVal: number;
    severity?: string;
    financialImpact: string;
    color: string;
  }> = [];

  if (isSensitivity) {
    // Modeled deductions based on live stress controls + diligence factors
    const cacHaircut = Math.round(claimedValuation * (0.04 + (cacInflation / 80) * 0.11) * 10) / 10;
    const salesChurnHaircut = Math.round(
      claimedValuation * (0.05 + (salesCycleSlippage / 180) * 0.08 + (grossChurnSpike / 5) * 0.08) * 10
    ) / 10;
    const marginHaircut = Math.round(claimedValuation * (0.04 + (grossMarginDrop / 25) * 0.09) * 10) / 10;
    const diligenceHaircut = Math.round(claimedValuation * 0.07 * 10) / 10;

    const stressItems = [
      {
        id: 'cac-drag',
        name: `CAC Inflation (+${cacInflation}%)`,
        fullName: `Paid CAC Inflation & Payback Drag (+${cacInflation}%)`,
        haircut: cacHaircut,
        severity: cacInflation > 30 ? 'HIGH' : 'MODERATE',
        financialImpact: `+${cacInflation}% increase in paid acquisition costs expands CAC payback and compresses contribution margins.`,
        color: '#f59e0b',
      },
      {
        id: 'sales-churn-drag',
        name: 'Sales Delay & Churn',
        fullName: `Sales Cycle Slippage (+${salesCycleSlippage}d) & Churn (+${grossChurnSpike.toFixed(1)}%)`,
        haircut: salesChurnHaircut,
        severity: salesCycleSlippage > 60 || grossChurnSpike > 2 ? 'CRITICAL' : 'HIGH',
        financialImpact: `+${salesCycleSlippage} days enterprise sales cycle delay and +${grossChurnSpike.toFixed(1)}%/mo gross churn impairing net revenue retention.`,
        color: '#2563eb',
      },
      {
        id: 'margin-cogs-drag',
        name: `Margin Drop (-${grossMarginDrop}%)`,
        fullName: `Gross Margin Compression & COGS Escalation (-${grossMarginDrop}%)`,
        haircut: marginHaircut,
        severity: grossMarginDrop > 10 ? 'HIGH' : 'MODERATE',
        financialImpact: `-${grossMarginDrop}% gross margin reduction due to infrastructure COGS and support scaling, contracting software valuation multiples.`,
        color: '#e11d48',
      },
      {
        id: 'diligence-omissions',
        name: 'Cap Table & Omissions',
        fullName: 'Uncovered Diligence & Cap Table Reserve Omissions',
        haircut: diligenceHaircut,
        severity: 'HIGH',
        financialImpact: 'Diligence findings: single-customer concentration and option pool dilution required prior to closing.',
        color: '#64748b',
      },
    ];

    deductions = stressItems.map((item) => {
      const prevVal = remainingVal;
      remainingVal = Math.max(5, Math.round((remainingVal - item.haircut) * 10) / 10);
      return {
        id: item.id,
        name: item.name,
        fullName: item.fullName,
        type: 'deduction' as const,
        value: -item.haircut,
        displayVal: item.haircut,
        startVal: prevVal,
        endVal: remainingVal,
        severity: item.severity,
        financialImpact: item.financialImpact,
        color: item.color,
      };
    });
  } else {
    // Legacy forensic gaps mode
    deductions = flags.map((flag) => {
      let haircut = 0;
      if (flag.severity === 'CRITICAL') {
        haircut = Math.round(claimedValuation * 0.18 * 10) / 10;
      } else if (flag.severity === 'HIGH') {
        haircut = Math.round(claimedValuation * 0.11 * 10) / 10;
      } else {
        haircut = Math.round(claimedValuation * 0.06 * 10) / 10;
      }
      haircut = Math.max(1.5, haircut);

      const prevVal = remainingVal;
      remainingVal = Math.max(5, Math.round((remainingVal - haircut) * 10) / 10);

      const shortTitle =
        flag.title.length > 20 ? flag.title.substring(0, 18) + '...' : flag.title;

      return {
        id: flag.id,
        name: shortTitle,
        fullName: flag.title,
        type: 'deduction' as const,
        value: -haircut,
        displayVal: haircut,
        startVal: prevVal,
        endVal: remainingVal,
        severity: flag.severity,
        financialImpact: flag.financialImpact,
        color: flag.severity === 'CRITICAL' ? '#e11d48' : flag.severity === 'HIGH' ? '#f59e0b' : '#64748b',
      };
    });
  }

  const finalAdjustedValuation = Math.max(5, remainingVal);
  const totalHaircut = Math.round((claimedValuation - finalAdjustedValuation) * 10) / 10;
  const totalHaircutPct = Math.round((totalHaircut / (claimedValuation || 1)) * 100);

  const chartData = [
    {
      id: 'claim',
      name: 'Founder Ask',
      fullName: 'Pitch Deck Claimed Headline Valuation',
      base: 0,
      amount: claimedValuation,
      color: '#3b82f6',
      isTotal: true,
      displayVal: claimedValuation,
      type: 'initial',
      financialImpact: 'Initial baseline headline valuation claimed by founders in pitch materials.',
    },
    ...deductions.map((d) => ({
      id: d.id,
      name: d.name,
      fullName: d.fullName,
      base: d.endVal,
      amount: d.displayVal,
      color: d.color,
      isTotal: false,
      displayVal: d.displayVal,
      type: 'deduction',
      severity: d.severity,
      financialImpact: d.financialImpact,
    })),
    {
      id: 'adjusted',
      name: isSensitivity ? 'Stressed Value' : 'Audited Value',
      fullName: isSensitivity
        ? 'IC Post-Stress Downside Target Valuation'
        : 'IC Risk-Adjusted Fair Valuation',
      base: 0,
      amount: finalAdjustedValuation,
      color: '#059669',
      isTotal: true,
      displayVal: finalAdjustedValuation,
      type: 'final',
      financialImpact: isSensitivity
        ? 'Maximum defensible entry valuation after factoring operational headwind stress and downside multiple compression.'
        : 'Maximum defensible entry valuation after discounting unblended CAC, hidden COGS, and cap table leakage.',
    },
  ];

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <h3 className="text-base font-bold text-zinc-900 font-sans tracking-tight">
              {isSensitivity
                ? 'Downside Valuation Stress & Haircut Waterfall ($ Millions)'
                : 'Forensic Valuation Haircut & Downside Waterfall ($ Millions)'}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isSensitivity
              ? 'Quantified equity impairment waterfall modeled across live headwind stress parameters and diligence risk deductions.'
              : 'Quantified valuation discount modeling based on hidden COGS, churn cliffs, and cap table omissions.'}
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-xs">
            <span className="text-rose-700 font-semibold">Total Stress Haircut:</span>
            <span className="font-extrabold text-rose-800 tabular-nums">
              -${totalHaircut}M (-{totalHaircutPct}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
            <span className="text-emerald-700 font-semibold">Post-Stress Fair Value:</span>
            <span className="font-extrabold text-emerald-800 tabular-nums">
              ${finalAdjustedValuation}M
            </span>
          </div>
          {neededCapitalFor18Mo !== undefined && (
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 text-xs hidden lg:flex">
              <span className="text-blue-700 font-semibold">18-mo Capital Need:</span>
              <span className="font-extrabold text-blue-800 tabular-nums">
                ${neededCapitalFor18Mo}M
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Waterfall Visual Chart */}
      <div className="h-64 w-full bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                const target = state.activePayload[0].payload;
                if (target.id && target.id !== 'claim' && target.id !== 'adjusted' && onSelectFlag) {
                  onSelectFlag(target.id);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.7} vertical={false} />
            <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} unit="M" tickFormatter={(val) => `$${val}`} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-lg text-xs space-y-1.5 max-w-xs">
                      <div className="font-bold text-zinc-900 border-b border-zinc-100 pb-1 flex justify-between items-center">
                        <span>{d.fullName}</span>
                        {d.severity && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              d.severity === 'CRITICAL'
                                ? 'bg-rose-50 text-rose-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {d.severity}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">
                          {d.type === 'initial'
                            ? 'Claimed Valuation:'
                            : d.type === 'deduction'
                            ? 'Quantified Haircut:'
                            : 'Fair Value Target:'}
                        </span>
                        <strong
                          className={
                            d.type === 'deduction'
                              ? 'text-rose-700'
                              : d.type === 'final'
                              ? 'text-emerald-700'
                              : 'text-blue-700'
                          }
                        >
                          {d.type === 'deduction' ? `-$${d.displayVal}M` : `$${d.displayVal}M`}
                        </strong>
                      </div>
                      <p className="text-[11px] text-zinc-600 pt-1 border-t border-zinc-100 leading-relaxed">
                        {d.financialImpact}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Transparent placeholder bar to lift deductions to the proper height */}
            <Bar dataKey="base" stackId="waterfall" fill="transparent" />
            {/* The colored bar representing the change */}
            <Bar dataKey="amount" stackId="waterfall" radius={[4, 4, 0, 0]} barSize={34}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className={entry.type === 'deduction' ? 'hover:opacity-85' : ''}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Waterfall Breakdown Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5">
          <div className="text-[10px] uppercase font-semibold text-zinc-500">Deck Valuation</div>
          <div className="text-base font-bold text-zinc-900 tabular-nums mt-0.5">${claimedValuation}M</div>
          <div className="text-[10px] text-zinc-400">Founder Pre-Money Ask</div>
        </div>

        <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-2.5">
          <div className="text-[10px] uppercase font-semibold text-rose-800">Operational Headwinds</div>
          <div className="text-base font-bold text-rose-700 tabular-nums mt-0.5">
            -${Math.round(totalHaircut * 0.55 * 10) / 10}M
          </div>
          <div className="text-[10px] text-rose-600 font-medium">CAC & Margin Drag</div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-2.5">
          <div className="text-[10px] uppercase font-semibold text-amber-800">Pipeline & Retention</div>
          <div className="text-base font-bold text-amber-700 tabular-nums mt-0.5">
            -${Math.round(totalHaircut * 0.45 * 10) / 10}M
          </div>
          <div className="text-[10px] text-amber-600 font-medium">Sales Slip & Churn Cliff</div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2.5">
          <div className="text-[10px] uppercase font-semibold text-emerald-800">Post-Stress Target</div>
          <div className="text-base font-bold text-emerald-700 tabular-nums mt-0.5">
            ${finalAdjustedValuation}M
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">IC Recommended Entry</div>
        </div>
      </div>
    </div>
  );
};

