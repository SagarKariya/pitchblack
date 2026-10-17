import React, { useState } from 'react';
import { FullDiligenceReport } from '../types';
import {
  GrowthVelocityHeatmap,
  CohortFilterType,
} from './GrowthVelocityHeatmap';
import {
  Flame,
  Activity,
  Zap,
} from 'lucide-react';

interface GrowthVelocityPillarProps {
  report: FullDiligenceReport;
}

export const GrowthVelocityPillar: React.FC<GrowthVelocityPillarProps> = ({ report }) => {
  const { companyName, baseline } = report;
  const [cohortFilter, setCohortFilter] = useState<CohortFilterType>('ALL_COHORTS');

  // Compute key summary figures from historical trajectory or baseline
  const ltmArr = baseline.arr;
  const monthlyBurn = baseline.monthlyBurn;

  return (
    <div className="space-y-6">
      {/* Pillar 06 Banner Header - Institutional Visual Similarity */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                Pillar 06 · Growth Velocity & Cohort
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-3xl leading-relaxed">
              Granular month-over-month ARR acceleration and cohort dynamics decomposed across first-time customer acquisition and installed base net expansion, benchmarked against a16z and Bessemer Cloud top-quartile velocity metrics.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl self-start md:self-auto shadow-xs shrink-0">
            <Activity className="w-4 h-4 text-orange-600 shrink-0" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Cohort Scope</div>
              <span className="text-xs font-bold text-zinc-900">12 MoM Epochs · Multi-Cohort</span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-100">
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Current ARR Scale</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums">
              ${ltmArr.toFixed(1)}M
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Active Filter View</span>
            <div className="text-sm font-bold text-zinc-900 mt-0.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cohortFilter === 'NEW_CUSTOMERS' ? 'bg-emerald-500' : cohortFilter === 'EXPANSION_REVENUE' ? 'bg-blue-600' : 'bg-orange-500'}`} />
              <span className="truncate">
                {cohortFilter === 'ALL_COHORTS' && 'All Blended ARR'}
                {cohortFilter === 'NEW_CUSTOMERS' && 'New Logo Pipeline'}
                {cohortFilter === 'EXPANSION_REVENUE' && 'Expansion Revenue'}
              </span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Monthly Cash Consumption</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums">
              ${(monthlyBurn * 1000).toLocaleString()}/mo
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80">
            <span className="text-[11px] font-medium text-zinc-500 block">Institutional Target</span>
            <div className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Top-Quartile SaaS (&gt;8% MoM)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Velocity Heatmap Component */}
      <GrowthVelocityHeatmap
        report={report}
        cohortFilter={cohortFilter}
        onCohortFilterChange={setCohortFilter}
      />
    </div>
  );
};
