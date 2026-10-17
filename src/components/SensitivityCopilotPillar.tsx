import React, { useState } from 'react';
import { FullDiligenceReport } from '../types';
import { calculateRunwaySensitivity } from '../data/heuristicAuditor';
import {
  Sliders,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ForensicValuationWaterfall } from './ForensicValuationWaterfall';

interface SensitivityCopilotPillarProps {
  report: FullDiligenceReport;
  isExpandedAll?: boolean;
  onNavigateToPitchAIChat?: () => void;
}

export const SensitivityCopilotPillar: React.FC<SensitivityCopilotPillarProps> = ({
  report,
}) => {
  const { baseline, companyName } = report;

  // Simulator state
  const [cacInflation, setCacInflation] = useState<number>(0);
  const [salesCycleSlippage, setSalesCycleSlippage] = useState<number>(0);
  const [grossChurnSpike, setGrossChurnSpike] = useState<number>(0);
  const [grossMarginDrop, setGrossMarginDrop] = useState<number>(0);
  const [chartTab, setChartTab] = useState<'burn' | 'tornado' | 'valuation'>('burn');

  // Calculate live sensitivity
  const sensitivity = calculateRunwaySensitivity(baseline, {
    cacInflation,
    salesCycleSlippage,
    grossChurnSpike,
    grossMarginDrop,
  });

  // Generate 18-month burn down data points for Recharts
  const projectionMonths = [0, 3, 6, 9, 12, 15, 18];
  const burnDownData = projectionMonths.map((m) => {
    const baselineCash = Math.max(0, Math.round((baseline.cashOnHand - m * baseline.monthlyBurn) * 100) / 100);
    const stressedCash = Math.max(
      0,
      Math.round((baseline.cashOnHand - m * sensitivity.revisedMonthlyBurn) * 100) / 100
    );
    return {
      month: `M+${m}`,
      baselineCash,
      stressedCash,
    };
  });

  // Dynamic Headwind Tornado Data showing marginal runway months lost per factor
  const headwindTornadoData = [
    {
      factor: 'Gross Churn Spike',
      setting: `+${grossChurnSpike.toFixed(1)}%/mo`,
      monthsLost: Number((Math.max(0.2, (grossChurnSpike / 5) * 5.2)).toFixed(1)),
      color: '#e11d48',
    },
    {
      factor: 'Sales Delay',
      setting: `+${salesCycleSlippage}d`,
      monthsLost: Number((Math.max(0.2, (salesCycleSlippage / 180) * 4.1)).toFixed(1)),
      color: '#2563eb',
    },
    {
      factor: 'CAC Inflation',
      setting: `+${cacInflation}%`,
      monthsLost: Number((Math.max(0.2, (cacInflation / 80) * 3.4)).toFixed(1)),
      color: '#f59e0b',
    },
    {
      factor: 'Margin Drop',
      setting: `-${grossMarginDrop}%`,
      monthsLost: Number((Math.max(0.2, (grossMarginDrop / 25) * 2.8)).toFixed(1)),
      color: '#64748b',
    },
  ];

  // Valuation Compression & Capital Need
  const valuationSensitivityData = [
    {
      name: 'Deck Ask',
      amount: baseline.valuationClaim || 65,
      type: 'Valuation ($M)',
      color: '#3b82f6',
    },
    {
      name: 'Stressed Val',
      amount: Math.max(5, Math.round((baseline.valuationClaim || 65) * (1 - sensitivity.valuationHaircut / 100) * 10) / 10),
      type: 'Valuation ($M)',
      color: '#059669',
    },
    {
      name: '18-mo Gap',
      amount: sensitivity.neededCapitalFor18Mo,
      type: 'Capital Need ($M)',
      color: '#e11d48',
    },
  ];

  const handleResetSliders = () => {
    setCacInflation(0);
    setSalesCycleSlippage(0);
    setGrossChurnSpike(0);
    setGrossMarginDrop(0);
  };

  return (
    <div className="space-y-6">
      {/* Pillar 05 Banner Header - Institutional Visual Similarity */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Pillar 05 · Runway & Stress Test
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-3xl leading-relaxed">
              Downside scenarios and cash burn simulator to stress-test operational headwinds against zero-cash date, inspect runway decay across multiple adverse scenarios, and recalculate funding gaps in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl shadow-xs self-start md:self-auto shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${sensitivity.revisedRunwayMonths < 12 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Stressed Runway</div>
              <span className="text-xs font-bold text-zinc-900">
                {sensitivity.revisedRunwayMonths.toFixed(1)} Months Left
              </span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-100">
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-zinc-500 block">Baseline Runway</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums">
              {baseline.runwayMonths} Months
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-blue-700 block">Stressed Runway</span>
            <div className="text-lg font-black text-blue-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {sensitivity.revisedRunwayMonths.toFixed(1)} Months
              <span className="text-[11px] font-normal text-rose-600">
                (-{sensitivity.runwayLostMonths.toFixed(1)} mo)
              </span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-rose-700 block">Stressed Burn Rate</span>
            <div className="text-lg font-black text-rose-700 mt-0.5 tabular-nums">
              ${(sensitivity.revisedMonthlyBurn * 1000).toFixed(0)}k / mo
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-amber-700 block">18-Month Buffer Needed</span>
            <div className="text-lg font-black text-amber-700 mt-0.5 tabular-nums">
              ${sensitivity.neededCapitalFor18Mo.toFixed(2)}M
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE HEADWIND STRESS SIMULATOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Interactive Headwind Stress Simulator
          </h3>
          <span className="text-[11px] text-zinc-400 font-medium">Adjust sliders to recalculate cash zero-date in real time</span>
        </div>
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sliders Panel */}
          <div className="lg:col-span-5 bg-white border border-zinc-200/90 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-zinc-900 font-sans">
                  Headwind Stress Controls
                </h3>
              </div>
              <button
                onClick={handleResetSliders}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 text-xs rounded-lg border border-zinc-200 transition-colors cursor-pointer shadow-2xs font-medium"
                title="Reset all stress sliders to zero"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                <span>Reset</span>
              </button>
            </div>

            {/* Slider 1: CAC Inflation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-800 font-semibold">1. Paid CAC Inflation:</span>
                <span className="text-blue-700 font-bold tabular-nums">+{cacInflation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={cacInflation}
                onChange={(e) => setCacInflation(Number(e.target.value))}
                aria-label="Paid Customer Acquisition Cost Inflation Percentage"
                aria-valuenow={cacInflation}
                className="w-full accent-blue-600 bg-zinc-200 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Baseline ($14k)</span>
                <span>+40% ($20k)</span>
                <span>+80% ($25k+)</span>
              </div>
            </div>

            {/* Slider 2: Sales Cycle Slippage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-800 font-semibold">2. Sales Cycle Delay:</span>
                <span className="text-blue-700 font-bold tabular-nums">+{salesCycleSlippage} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="15"
                value={salesCycleSlippage}
                onChange={(e) => setSalesCycleSlippage(Number(e.target.value))}
                aria-label="Enterprise Sales Cycle Delay in Days"
                aria-valuenow={salesCycleSlippage}
                className="w-full accent-blue-600 bg-zinc-200 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>0 Days (Normal)</span>
                <span>+90 Days</span>
                <span>+180 Days (Frozen)</span>
              </div>
            </div>

            {/* Slider 3: Gross Churn Spike */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-800 font-semibold">3. Gross Churn Spike:</span>
                <span className="text-zinc-900 font-bold tabular-nums">+{grossChurnSpike.toFixed(1)}% / mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={grossChurnSpike}
                onChange={(e) => setGrossChurnSpike(Number(e.target.value))}
                aria-label="Monthly Gross Churn Spike Percentage"
                aria-valuenow={grossChurnSpike}
                className="w-full accent-zinc-800 bg-zinc-200 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>0% (Steady)</span>
                <span>+2.5% / mo</span>
                <span>+5.0% / mo (Fatal)</span>
              </div>
            </div>

            {/* Slider 4: Gross Margin Compression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-800 font-semibold">4. Gross Margin Drop:</span>
                <span className="text-zinc-900 font-bold tabular-nums">-{grossMarginDrop}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="5"
                value={grossMarginDrop}
                onChange={(e) => setGrossMarginDrop(Number(e.target.value))}
                aria-label="Gross Profit Margin Compression Percentage"
                aria-valuenow={grossMarginDrop}
                className="w-full accent-zinc-800 bg-zinc-200 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>0% (Unchanged)</span>
                <span>-10%</span>
                <span>-25% (Heavy COGS)</span>
              </div>
            </div>
          </div>

          {/* Live Impact & Projection Chart */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            {/* Key Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3">
                <div className="text-xs uppercase text-zinc-500 font-medium">Revised Runway</div>
                <div className="text-xl font-bold mt-1 text-blue-700 tabular-nums">
                  {sensitivity.revisedRunwayMonths} mo
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 tabular-nums">
                  -{sensitivity.runwayLostMonths} mo lost
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3">
                <div className="text-xs uppercase text-zinc-500 font-medium">Stressed Burn</div>
                <div className="text-xl font-bold text-zinc-900 tabular-nums mt-1">
                  ${Math.round(sensitivity.revisedMonthlyBurn * 1000)}k
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 tabular-nums">
                  vs ${Math.round(baseline.monthlyBurn * 1000)}k base
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3">
                <div className="text-xs uppercase text-zinc-500 font-medium">18-mo Shortfall</div>
                <div className="text-xl font-bold text-rose-700 tabular-nums mt-1">
                  ${sensitivity.neededCapitalFor18Mo}M
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  to reach next round
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3">
                <div className="text-xs uppercase text-zinc-500 font-medium">Down-Round Risk</div>
                <div className="text-xl font-bold text-rose-700 tabular-nums mt-1">
                  -{sensitivity.valuationHaircut}%
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  valuation haircut
                </div>
              </div>
            </div>

            {/* Visual Scenario & Stress-Testing Charts */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-900 font-bold uppercase tracking-wide">
                    {chartTab === 'burn' && '18-Month Cash Runway Burn Down ($M)'}
                    {chartTab === 'tornado' && 'Headwind Tornado: Marginal Runway Lost (Months)'}
                    {chartTab === 'valuation' && 'Valuation Compression & 18-Month Capital Need ($M)'}
                  </span>
                </div>

                {/* View Switcher */}
                <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setChartTab('burn')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      chartTab === 'burn'
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Burn Down
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartTab('tornado')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      chartTab === 'tornado'
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Headwind Tornado
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartTab('valuation')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      chartTab === 'valuation'
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Valuation Gap
                  </button>
                </div>
              </div>

              <div className="h-56 w-full animate-fadeIn">
                <ResponsiveContainer width="100%" height="100%">
                  {chartTab === 'burn' ? (
                    <LineChart data={burnDownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.7} vertical={false} />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} unit="M" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#0f172a',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        }}
                        formatter={(val: any) => [`$${val}M`, '']}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Line
                        type="monotone"
                        dataKey="baselineCash"
                        name="Base Runway Projection"
                        stroke="#059669"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="stressedCash"
                        name="Stressed Headwind Runway"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  ) : chartTab === 'tornado' ? (
                    <BarChart
                      data={headwindTornadoData}
                      layout="vertical"
                      margin={{ top: 10, right: 25, left: 35, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.7} horizontal={false} />
                      <XAxis type="number" stroke="#71717a" fontSize={11} unit=" mo" />
                      <YAxis
                        type="category"
                        dataKey="factor"
                        stroke="#3f3f46"
                        fontSize={11}
                        tickLine={false}
                        width={105}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-lg text-xs space-y-1">
                                <span className="font-bold text-zinc-900 block">{d.factor}</span>
                                <div className="text-zinc-600 flex justify-between gap-4">
                                  <span>Current Setting:</span>
                                  <strong className="text-zinc-900">{d.setting}</strong>
                                </div>
                                <div className="text-rose-700 flex justify-between gap-4 font-semibold">
                                  <span>Runway Lost:</span>
                                  <strong>-{d.monthsLost} months</strong>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="monthsLost" radius={[0, 6, 6, 0]} barSize={20}>
                        {headwindTornadoData.map((entry, index) => (
                          <Cell key={`tornado-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <BarChart
                      data={valuationSensitivityData}
                      margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.7} vertical={false} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} unit="M" tickFormatter={(val) => `$${val}`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-lg text-xs space-y-1">
                                <span className="font-bold text-zinc-900 block">{d.name}</span>
                                <div className="text-zinc-600 flex justify-between gap-4">
                                  <span>{d.type}:</span>
                                  <strong className="text-zinc-900">${d.amount}M</strong>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={36}>
                        {valuationSensitivityData.map((entry, index) => (
                          <Cell key={`val-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Downside Valuation Stress & Haircut Waterfall (Pillar 6 Theme) */}
      <ForensicValuationWaterfall
        flags={report.forensicGaps}
        claimedValuation={baseline.valuationClaim || 65}
        cacInflation={cacInflation}
        salesCycleSlippage={salesCycleSlippage}
        grossChurnSpike={grossChurnSpike}
        grossMarginDrop={grossMarginDrop}
        valuationHaircutPct={sensitivity.valuationHaircut}
        neededCapitalFor18Mo={sensitivity.neededCapitalFor18Mo}
        variant="sensitivity"
      />
    </div>
  );
};
