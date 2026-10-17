import React from 'react';
import { ForensicOmission } from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Flame,
  CheckCircle2,
  Filter,
  Layers,
  ChevronDown,
} from 'lucide-react';

export type RiskQuadrantKey = 'ALL' | 'CRITICAL_KILLPOINTS' | 'TACTICAL_HURDLES' | 'STRATEGIC_RISKS' | 'MONITORED_ITEMS';

interface RiskHeatmapMatrixProps {
  flags: ForensicOmission[];
  selectedQuadrant: RiskQuadrantKey;
  onSelectQuadrant: (quadrant: RiskQuadrantKey) => void;
  onSelectFlag: (flagId: string) => void;
}

export interface ClassifiedFlag extends ForensicOmission {
  calculatedUrgency: 'HIGH' | 'LOW';
  calculatedImpact: 'HIGH' | 'LOW';
  quadrantKey: 'CRITICAL_KILLPOINTS' | 'TACTICAL_HURDLES' | 'STRATEGIC_RISKS' | 'MONITORED_ITEMS';
  quadrantTitle: string;
  quadrantBadge: string;
}

export function classifyFlag(flag: ForensicOmission): ClassifiedFlag {
  let urgency = flag.urgency;
  let impact = flag.impact;

  // Intelligent fallback classification if not explicitly populated
  if (!urgency || !impact) {
    if (flag.severity === 'CRITICAL') {
      urgency = 'HIGH';
      impact = 'HIGH';
    } else if (flag.severity === 'HIGH') {
      const text = `${flag.title} ${flag.concealedReality} ${flag.remediationAction}`.toLowerCase();
      if (
        text.includes('hold') ||
        text.includes('fda') ||
        text.includes('sponsor') ||
        text.includes('cogs') ||
        text.includes('credit') ||
        text.includes('runway') ||
        text.includes('mrr') ||
        text.includes('hardware')
      ) {
        urgency = 'HIGH';
        impact = 'HIGH';
      } else {
        urgency = 'LOW';
        impact = 'HIGH';
      }
    } else {
      const text = `${flag.title} ${flag.financialImpact}`.toLowerCase();
      if (text.includes('esop') || text.includes('pool') || text.includes('cap table') || text.includes('rma')) {
        urgency = 'HIGH';
        impact = 'LOW';
      } else {
        urgency = 'LOW';
        impact = 'LOW';
      }
    }
  }

  let quadrantKey: ClassifiedFlag['quadrantKey'];
  let quadrantTitle: string;
  let quadrantBadge: string;

  if (urgency === 'HIGH' && impact === 'HIGH') {
    quadrantKey = 'CRITICAL_KILLPOINTS';
    quadrantTitle = 'Critical Kill-Points (Immediate Blockers)';
    quadrantBadge = 'Pre-Term Sheet Audit';
  } else if (urgency === 'HIGH' && impact === 'LOW') {
    quadrantKey = 'TACTICAL_HURDLES';
    quadrantTitle = 'Tactical Hurdles (Closing Conditions)';
    quadrantBadge = 'Pre-Closing Covenants';
  } else if (urgency === 'LOW' && impact === 'HIGH') {
    quadrantKey = 'STRATEGIC_RISKS';
    quadrantTitle = 'Strategic Diligence (Structural Headwinds)';
    quadrantBadge = 'Valuation & Moat Drag';
  } else {
    quadrantKey = 'MONITORED_ITEMS';
    quadrantTitle = 'Monitored Items (Operational Risks)';
    quadrantBadge = 'Post-Close Board Hygiene';
  }

  return {
    ...flag,
    calculatedUrgency: urgency,
    calculatedImpact: impact,
    quadrantKey,
    quadrantTitle,
    quadrantBadge,
  };
}

export const RiskHeatmapMatrix: React.FC<RiskHeatmapMatrixProps> = ({
  flags,
  selectedQuadrant,
  onSelectQuadrant,
  onSelectFlag,
}) => {
  const classifiedFlags = flags.map(classifyFlag);

  // Group by quadrants
  const criticalKillpoints = classifiedFlags.filter((f) => f.quadrantKey === 'CRITICAL_KILLPOINTS');
  const tacticalHurdles = classifiedFlags.filter((f) => f.quadrantKey === 'TACTICAL_HURDLES');
  const strategicRisks = classifiedFlags.filter((f) => f.quadrantKey === 'STRATEGIC_RISKS');
  const monitoredItems = classifiedFlags.filter((f) => f.quadrantKey === 'MONITORED_ITEMS');

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 lg:p-7 shadow-sm space-y-6">
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Risk Heatmap & Prioritization Matrix</span>
            </span>
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
              2x2 Urgency vs Impact Framework
            </span>
          </div>
          <h3 className="text-lg lg:text-xl font-bold text-zinc-900 tracking-tight mt-1.5">
            Diligence Triage Matrix: Urgency vs Valuation Impact
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
            Institutional investment committee triage sorting forensic omissions by time sensitivity (Pre-Term Sheet vs Confirmatory) against valuation erosion potential.
          </p>
        </div>

        {/* Total Summary Counters */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span>{criticalKillpoints.length} Kill-Points</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{strategicRisks.length} Strategic</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>{tacticalHurdles.length} Tactical</span>
          </div>
        </div>
      </div>

      {/* Interactive Quadrant Filter Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-zinc-500 font-medium flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter by Quadrant:
        </span>
        <button
          onClick={() => onSelectQuadrant('ALL')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
            selectedQuadrant === 'ALL'
              ? 'bg-zinc-900 text-white font-bold shadow-xs'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          All Flags ({flags.length})
        </button>

        <button
          onClick={() => onSelectQuadrant('CRITICAL_KILLPOINTS')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            selectedQuadrant === 'CRITICAL_KILLPOINTS'
              ? 'bg-rose-700 text-white font-bold shadow-xs'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Immediate Kill-Points ({criticalKillpoints.length})</span>
        </button>

        <button
          onClick={() => onSelectQuadrant('STRATEGIC_RISKS')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            selectedQuadrant === 'STRATEGIC_RISKS'
              ? 'bg-amber-700 text-white font-bold shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Strategic Risks ({strategicRisks.length})</span>
        </button>

        <button
          onClick={() => onSelectQuadrant('TACTICAL_HURDLES')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            selectedQuadrant === 'TACTICAL_HURDLES'
              ? 'bg-blue-700 text-white font-bold shadow-xs'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/80'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Tactical Hurdles ({tacticalHurdles.length})</span>
        </button>

        {monitoredItems.length > 0 && (
          <button
            onClick={() => onSelectQuadrant('MONITORED_ITEMS')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedQuadrant === 'MONITORED_ITEMS'
                ? 'bg-zinc-800 text-white font-bold shadow-xs'
                : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span>Monitored Items ({monitoredItems.length})</span>
          </button>
        )}
      </div>

      {/* 2X2 RISK HEATMAP MATRIX CONTAINER */}
      <div className="relative border border-zinc-200 rounded-2xl p-3 sm:p-5 bg-zinc-50/50 overflow-hidden shadow-2xs">
        {/* Outer Visual Coordinate Axis Labels */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 pb-2.5 border-b border-zinc-200/70 mb-3 px-1">
          <span className="flex items-center gap-1.5 text-zinc-700">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Vertical (Y-Axis): Diligence Urgency (High → Low)</span>
          </span>
          <span className="flex items-center gap-1.5 text-zinc-700">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Horizontal (X-Axis): Valuation & Moat Impact (Low → High)</span>
          </span>
        </div>

        {/* Column Headers for X-Axis (Impact) */}
        <div className="hidden md:grid grid-cols-2 gap-4 mb-2 px-1">
          <div className="text-center py-1.5 px-3 bg-zinc-100/80 rounded-xl border border-zinc-200/70 text-[11px] font-bold text-zinc-600 uppercase tracking-wide flex items-center justify-center gap-1.5">
            <span>← Low / Moderate Valuation Impact</span>
          </div>
          <div className="text-center py-1.5 px-3 bg-rose-50/80 rounded-xl border border-rose-200/70 text-[11px] font-bold text-rose-800 uppercase tracking-wide flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>High / Severe Valuation Impact →</span>
          </div>
        </div>

        {/* Row 1 Label: High Urgency */}
        <div className="flex items-center gap-2 mb-2 px-1 text-[11px] font-bold uppercase text-zinc-600 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>High Urgency Tier · Pre-Term Sheet & Immediate Closing Requirements</span>
        </div>

        {/* 2x2 Grid Layout: Top Row (Tactical Hurdles | Critical Kill-Points) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative mb-4">
          {/* QUADRANT 1: HIGH URGENCY & LOW IMPACT (TOP-LEFT: TACTICAL HURDLES) */}
          <div
            onClick={() => onSelectQuadrant('TACTICAL_HURDLES')}
            className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between cursor-pointer ${
              selectedQuadrant === 'TACTICAL_HURDLES'
                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-md'
                : 'bg-white hover:bg-blue-50/30 border-blue-200/80 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-blue-900">
                      Tactical Hurdles
                    </h4>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      High Urgency · Low/Mod Impact
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  {tacticalHurdles.length} Flag{tacticalHurdles.length === 1 ? '' : 's'}
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 mt-2 mb-3 leading-relaxed">
                Mandatory pre-closing legal covenants, cap table true-ups, and mechanical contract terms.
              </p>

              {/* Flags inside Quadrant */}
              <div className="space-y-2 mt-2">
                {tacticalHurdles.length === 0 ? (
                  <div className="p-3 bg-zinc-50 rounded-xl text-center text-xs text-zinc-400 italic border border-dashed border-zinc-200">
                    No active tactical hurdles detected
                  </div>
                ) : (
                  tacticalHurdles.map((f) => (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFlag(f.id);
                      }}
                      className="group/flag p-2.5 bg-blue-50/70 hover:bg-blue-100/90 border border-blue-200/90 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-bold text-zinc-900 group-hover/flag:text-blue-900 leading-snug">
                          {f.title}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 opacity-60 group-hover/flag:opacity-100 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-1 mt-1 font-normal">
                        {f.financialImpact}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-blue-100 flex items-center justify-between text-[11px] text-blue-800 font-medium">
              <span>Action: Term Sheet Pre-Closing Covenant</span>
              <span className="font-bold underline decoration-dotted">Review Details →</span>
            </div>
          </div>

          {/* QUADRANT 2: HIGH URGENCY & HIGH IMPACT (TOP-RIGHT: CRITICAL KILL-POINTS) */}
          <div
            onClick={() => onSelectQuadrant('CRITICAL_KILLPOINTS')}
            className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between cursor-pointer ${
              selectedQuadrant === 'CRITICAL_KILLPOINTS'
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-md'
                : 'bg-white hover:bg-rose-50/40 border-rose-300 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-rose-950 flex items-center gap-1.5">
                      <span>Critical Kill-Points</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    </h4>
                    <span className="text-[10px] text-rose-700 font-semibold">
                      High Urgency · High/Severe Impact
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[11px] font-bold">
                  {criticalKillpoints.length} Flag{criticalKillpoints.length === 1 ? '' : 's'}
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 mt-2 mb-3 leading-relaxed">
                Deal-breakers requiring audit prior to term sheet issuance; directly compress ARR valuation multiple.
              </p>

              {/* Flags inside Quadrant */}
              <div className="space-y-2 mt-2">
                {criticalKillpoints.length === 0 ? (
                  <div className="p-3 bg-zinc-50 rounded-xl text-center text-xs text-zinc-400 italic border border-dashed border-zinc-200">
                    No critical kill-points identified
                  </div>
                ) : (
                  criticalKillpoints.map((f) => (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFlag(f.id);
                      }}
                      className="group/flag p-2.5 bg-rose-50/80 hover:bg-rose-100/90 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-bold text-zinc-900 group-hover/flag:text-rose-950 leading-snug">
                          {f.title}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 opacity-70 group-hover/flag:opacity-100 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-1 mt-1 font-normal">
                        {f.financialImpact}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-rose-100 flex items-center justify-between text-[11px] text-rose-800 font-medium">
              <span>Action: Pre-Term Sheet Forensic Audit</span>
              <span className="font-bold underline decoration-dotted">Review Details →</span>
            </div>
          </div>
        </div>

        {/* Row 2 Label: Low Urgency */}
        <div className="flex items-center gap-2 mb-2 px-1 text-[11px] font-bold uppercase text-zinc-600 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Low Urgency Tier · Confirmatory Diligence & Post-Close Monitoring</span>
        </div>

        {/* 2x2 Grid Layout: Bottom Row (Monitored Items | Strategic Risks) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* QUADRANT 3: LOW URGENCY & LOW IMPACT (BOTTOM-LEFT: MONITORED ITEMS) */}
          <div
            onClick={() => onSelectQuadrant('MONITORED_ITEMS')}
            className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between cursor-pointer ${
              selectedQuadrant === 'MONITORED_ITEMS'
                ? 'bg-zinc-100/90 border-zinc-400 ring-2 ring-zinc-500/20 shadow-md'
                : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zinc-100 text-zinc-700 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-800">
                      Monitored Items
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-semibold">
                      Low Urgency · Low/Mod Impact
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold">
                  {monitoredItems.length} Flag{monitoredItems.length === 1 ? '' : 's'}
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 mt-2 mb-3 leading-relaxed">
                Operational optimizations, single-supplier lead-time risks, and standard board governance items.
              </p>

              {/* Flags inside Quadrant */}
              <div className="space-y-2 mt-2">
                {monitoredItems.length === 0 ? (
                  <div className="p-3 bg-zinc-50 rounded-xl text-center text-xs text-zinc-400 italic border border-dashed border-zinc-200">
                    No low-urgency operational risks
                  </div>
                ) : (
                  monitoredItems.map((f) => (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFlag(f.id);
                      }}
                      className="group/flag p-2.5 bg-zinc-50 hover:bg-zinc-100/90 border border-zinc-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-bold text-zinc-900 group-hover/flag:text-black leading-snug">
                          {f.title}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-60 group-hover/flag:opacity-100 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-1 mt-1 font-normal">
                        {f.financialImpact}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-600 font-medium">
              <span>Action: Post-Close Quarterly Monitoring</span>
              <span className="font-bold underline decoration-dotted">Review Details →</span>
            </div>
          </div>

          {/* QUADRANT 4: LOW URGENCY & HIGH IMPACT (BOTTOM-RIGHT: STRATEGIC RISKS) */}
          <div
            onClick={() => onSelectQuadrant('STRATEGIC_RISKS')}
            className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between cursor-pointer ${
              selectedQuadrant === 'STRATEGIC_RISKS'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-md'
                : 'bg-white hover:bg-amber-50/40 border-amber-300 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-amber-950">
                      Strategic Risks
                    </h4>
                    <span className="text-[10px] text-amber-700 font-semibold">
                      Low Urgency · High/Severe Impact
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                  {strategicRisks.length} Flag{strategicRisks.length === 1 ? '' : 's'}
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 mt-2 mb-3 leading-relaxed">
                Structural headwinds eroding terminal value (unblended CAC creep, cohort contraction, concentration).
              </p>

              {/* Flags inside Quadrant */}
              <div className="space-y-2 mt-2">
                {strategicRisks.length === 0 ? (
                  <div className="p-3 bg-zinc-50 rounded-xl text-center text-xs text-zinc-400 italic border border-dashed border-zinc-200">
                    No strategic risks identified
                  </div>
                ) : (
                  strategicRisks.map((f) => (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFlag(f.id);
                      }}
                      className="group/flag p-2.5 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-bold text-zinc-900 group-hover/flag:text-amber-950 leading-snug">
                          {f.title}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 opacity-70 group-hover/flag:opacity-100 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-1 mt-1 font-normal">
                        {f.financialImpact}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-amber-100 flex items-center justify-between text-[11px] text-amber-800 font-medium">
              <span>Action: Confirmatory Diligence & Downside Stress-Test</span>
              <span className="font-bold underline decoration-dotted">Review Details →</span>
            </div>
          </div>
        </div>

        {/* Heatmap Legend and Directional Guides */}
        <div className="mt-4 pt-3 border-t border-zinc-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>Critical Action (Q1)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Strategic Risk (Q2)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span>Tactical Hurdle (Q3)</span>
            </span>
          </div>

          <span className="text-zinc-400 italic">
            Click any quadrant or flag card to isolate and inspect forensic evidence below
          </span>
        </div>
      </div>
    </div>
  );
};
