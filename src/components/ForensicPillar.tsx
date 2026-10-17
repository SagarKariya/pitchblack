import React, { useState } from 'react';
import { FullDiligenceReport } from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  EyeOff,
  ShieldAlert,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  classifyFlag,
} from './RiskHeatmapMatrix';

interface ForensicPillarProps {
  report: FullDiligenceReport;
}

export const ForensicPillar: React.FC<ForensicPillarProps> = ({ report }) => {
  const { forensicGaps } = report;
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE'>('ALL');
  const [highlightedFlagId] = useState<string | null>(null);

  const classifiedGaps = forensicGaps.map(classifyFlag);
  const visibleGaps =
    selectedSeverity === 'ALL'
      ? classifiedGaps
      : classifiedGaps.filter((g) => g.severity === selectedSeverity);

  const criticalCount = forensicGaps.filter((g) => g.severity === 'CRITICAL').length;
  const highCount = forensicGaps.filter((g) => g.severity === 'HIGH').length;
  const moderateCount = forensicGaps.filter((g) => g.severity === 'MODERATE').length;

  const getSeverityBadge = (sev: 'CRITICAL' | 'HIGH' | 'MODERATE') => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> CRITICAL CONCEALMENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-300">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600" /> MATERIAL OMISSION
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-300">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" /> MODERATE RISK
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Pillar 08 Banner Header - Institutional Visual Similarity */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                Pillar 08 · Hidden Risks & Omissions
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-3xl leading-relaxed">
              Missing data and concealment detection of what founders selectively omit or disguise in investor decks — including blended CAC obfuscation, truncated cohort decay, customer concentration, and depleted ESOP reserves.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl self-start md:self-auto shadow-xs shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Forensic Audit</div>
              <span className="text-xs font-bold text-zinc-900">
                {forensicGaps.length} Diligence Flags Uncovered
              </span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-100">
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-zinc-500 block">Total Omissions & Flags</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums">
              {forensicGaps.length} Diligence Anomalies
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-rose-700 block">Critical Killpoints</span>
            <div className="text-lg font-black text-rose-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {classifiedGaps.filter((g) => g.severity === 'CRITICAL').length}
              <span className="text-[11px] font-normal text-zinc-500">Deal-Breakers</span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-amber-700 block">High Severity Risks</span>
            <div className="text-lg font-black text-amber-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {classifiedGaps.filter((g) => g.severity === 'HIGH').length}
              <span className="text-[11px] font-normal text-zinc-500">Urgent</span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-blue-700 block">Moderate Hurdles</span>
            <div className="text-lg font-black text-blue-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {classifiedGaps.filter((g) => g.severity === 'MODERATE').length}
              <span className="text-[11px] font-normal text-zinc-500">Monitored</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Forensic Omission Dossier */}
      <div className="space-y-4">
        {/* Severity Filter Tabs */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-zinc-900 block">Filter Flags by Severity:</span>
            <p className="text-[11px] text-zinc-500">Examine findings by diligence risk materiality</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSeverity('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSeverity === 'ALL'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-50 text-zinc-600 border border-zinc-200 hover:text-zinc-900'
              }`}
            >
              All Flags ({forensicGaps.length})
            </button>
            <button
              onClick={() => setSelectedSeverity('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSeverity === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setSelectedSeverity('HIGH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSeverity === 'HIGH'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              High ({highCount})
            </button>
            <button
              onClick={() => setSelectedSeverity('MODERATE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSeverity === 'MODERATE'
                  ? 'bg-zinc-700 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200'
              }`}
            >
              Moderate ({moderateCount})
            </button>
          </div>
        </div>

        {/* Forensic Gap Cards (Fully Expanded) */}
        <div className="space-y-4">
          {visibleGaps.map((gap) => {
            const isHighlighted = highlightedFlagId === gap.id;

            return (
              <div
                key={gap.id}
                id={`gap-${gap.id}`}
                className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-sm space-y-4 ${
                  isHighlighted
                    ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-lg scale-[1.008]'
                    : 'border-zinc-200/90 hover:border-zinc-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          gap.quadrantKey === 'CRITICAL_KILLPOINTS'
                            ? 'bg-rose-600 animate-pulse'
                            : gap.quadrantKey === 'STRATEGIC_RISKS'
                            ? 'bg-amber-500'
                            : gap.quadrantKey === 'TACTICAL_HURDLES'
                            ? 'bg-blue-600'
                            : 'bg-zinc-400'
                        }`}
                      />
                      {gap.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {getSeverityBadge(gap.severity)}
                  </div>
                </div>

                {/* Full Documentation (Always Expanded) */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Surface Claim */}
                    <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4">
                      <div className="text-[11px] uppercase font-bold text-zinc-500 mb-1 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Pitch Deck Surface Claim:
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed italic">
                        "{gap.surfaceClaim}"
                      </p>
                    </div>

                    {/* Forensic Reality */}
                    <div className="bg-rose-50/40 border border-rose-200/70 rounded-xl p-4">
                      <div className="text-[11px] uppercase font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Diligence Room Reality:
                      </div>
                      <p className="text-xs text-rose-950/90 leading-relaxed font-medium">
                        {gap.concealedReality}
                      </p>
                    </div>
                  </div>

                  {/* Financial Impact & Remediation */}
                  <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 text-xs">
                    <div>
                      <span className="text-[11px] uppercase text-blue-700 font-bold block mb-1">
                        Valuation & Cap Table Impact:
                      </span>
                      <p className="text-zinc-600 leading-relaxed">
                        {gap.financialImpact}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase text-emerald-700 font-bold block mb-1">
                        Mandatory Data Room Remediation:
                      </span>
                      <div className="flex items-start gap-1.5 text-zinc-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed font-medium">
                          {gap.remediationAction}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
