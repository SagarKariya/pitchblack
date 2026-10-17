import React, { useState } from 'react';
import { FullDiligenceReport } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  Cpu,
  CreditCard,
  Stethoscope,
  Radio,
} from 'lucide-react';
import { SubsectorDiligenceChart } from './SubsectorDiligenceChart';

interface SubsectorPillarProps {
  report: FullDiligenceReport;
}

export const SubsectorPillar: React.FC<SubsectorPillarProps> = ({ report }) => {
  const { subsectorAudit, sector, companyName } = report;
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const handleSelectCheck = (index: number) => {
    setHighlightedIndex(index);
    const element = document.getElementById(`subsector-check-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setHighlightedIndex(null);
    }, 2500);
  };

  const getSectorIcon = (sec: string) => {
    switch (sec) {
      case 'ENTERPRISE_AI':
        return <Cpu className="w-5 h-5 text-blue-600" />;
      case 'FINTECH':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'HEALTHTECH':
        return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'IOT_HAAS':
        return <Radio className="w-5 h-5 text-emerald-600" />;
      default:
        return <Layers className="w-5 h-5 text-zinc-700" />;
    }
  };

  const getStatusIcon = (status: 'PASS' | 'FLAG' | 'FAIL') => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'FLAG':
        return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case 'FAIL':
        return <XCircle className="w-4 h-4 text-rose-600" />;
    }
  };

  const getStatusBadge = (status: 'PASS' | 'FLAG' | 'FAIL') => {
    switch (status) {
      case 'PASS':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            AUDIT PASSED
          </span>
        );
      case 'FLAG':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-300">
            MATERIAL FLAG
          </span>
        );
      case 'FAIL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs">
            CRITICAL FAIL
          </span>
        );
    }
  };

  const passedChecks = subsectorAudit.checks.filter((c) => c.status === 'PASS').length;
  const flaggedChecks = subsectorAudit.checks.filter((c) => c.status === 'FLAG').length;
  const failedChecks = subsectorAudit.checks.filter((c) => c.status === 'FAIL').length;

  return (
    <div className="space-y-6">
      {/* Pillar 07 Banner Header - Institutional Visual Similarity */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Pillar 07 · Sector-Specific Concerns
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-4xl leading-relaxed">
              Industry-specific risks and hurdle checks: {subsectorAudit.overview}
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl self-start md:self-auto shadow-xs shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${failedChecks === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Sector Compliance</div>
              <span className="text-xs font-bold text-zinc-900">
                {passedChecks}/{subsectorAudit.checks.length} Cleared · {failedChecks} Fails
              </span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-100">
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-zinc-500 block">Sector Diligence Scope</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums">
              {subsectorAudit.checks.length} Criteria
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-emerald-700 block">Passed Underwriting</span>
            <div className="text-lg font-black text-emerald-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {passedChecks}
              <span className="text-[11px] font-normal text-zinc-500">({Math.round((passedChecks / (subsectorAudit.checks.length || 1)) * 100)}%)</span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-blue-700 block">Flagged Diligence Risks</span>
            <div className="text-lg font-black text-blue-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {flaggedChecks}
              <span className="text-[11px] font-normal text-zinc-500">({Math.round((flaggedChecks / (subsectorAudit.checks.length || 1)) * 100)}%)</span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-rose-700 block">Critical Failures</span>
            <div className="text-lg font-black text-rose-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {failedChecks}
              <span className="text-[11px] font-normal text-zinc-500">({Math.round((failedChecks / (subsectorAudit.checks.length || 1)) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Radar & Overview Chart */}
      <SubsectorDiligenceChart
        checks={subsectorAudit.checks}
        sectorName={subsectorAudit.sectorName}
        onSelectCheck={handleSelectCheck}
      />

      {/* Vertical Compliance Checks Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {subsectorAudit.checks.map((check, idx) => {
              const isHighlighted = highlightedIndex === idx;
          const score = check.status === 'PASS' ? 92 : check.status === 'FLAG' ? 62 : 30;
          const barColor =
            check.status === 'PASS'
              ? 'bg-emerald-500'
              : check.status === 'FLAG'
              ? 'bg-blue-500'
              : 'bg-rose-500';

          return (
            <div
              key={idx}
              id={`subsector-check-${idx}`}
              className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-sm ${
                isHighlighted
                  ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-md scale-[1.01]'
                  : 'border-zinc-200/90 hover:border-zinc-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    <h3 className="text-sm font-bold text-zinc-900">
                      {check.pillar}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(check.status)}
                  </div>
                </div>

                {/* Visual Compliance Meter */}
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 mb-3 text-xs space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-medium">Compliance Readiness:</span>
                    <span className="font-bold tabular-nums text-zinc-900">{score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <div className="pt-1.5 border-t border-zinc-200/60 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-zinc-500">Observed State:</span>
                      <span className="text-zinc-900 font-bold tabular-nums text-right">{check.metricValue}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-zinc-500">VC Target Standard:</span>
                      <span className="text-emerald-700 font-bold tabular-nums text-right">{check.targetBenchmark}</span>
                    </div>
                  </div>
                </div>

                {/* Qualitative Findings & Institutional Risk (Always Expanded) */}
                <div className="space-y-3 pt-1">
                  <div className="mb-3">
                    <div className="text-xs uppercase font-semibold text-zinc-500 mb-1">
                      Diligence Finding:
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/70">
                      {check.finding}
                    </p>
                  </div>

                  {/* Institutional Risk */}
                  <div className={`pt-3 border-t border-zinc-100 p-3 rounded-xl border ${
                    check.status === 'FAIL'
                      ? 'bg-rose-50/40 border-rose-200/70'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className={`text-xs uppercase font-bold mb-0.5 ${
                      check.status === 'FAIL' ? 'text-rose-700' : 'text-blue-700'
                    }`}>
                      Institutional Risk Assessment:
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {check.institutionalRisk}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
