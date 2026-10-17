import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FullDiligenceReport } from '../types';
import {
  X,
  Copy,
  Check,
  Download,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  BarChart3,
  AlertOctagon,
  HelpCircle,
  TrendingUp,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Users,
  Compass,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { downloadICMemoPdf } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

interface ExportMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullDiligenceReport;
}

export const ExportMemoModal: React.FC<ExportMemoModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'markdown'>('interactive');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));

  if (!isOpen) return null;

  const {
    companyName = 'Target Startup',
    sector = 'GENERAL_SAAS',
    stage = 'Series A',
    targetRaise = '$5.0M',
    valuationClaim = '$25.0M',
    signal,
    metrics = [],
    baseline,
    historicalQuarters = [],
    cohortDecay = [],
    subsectorAudit,
    forensicGaps = [],
    questionBank = [],
  } = report;

  const safeScorecard = {
    founderTeam: {
      score: typeof signal?.scorecard?.founderTeam?.score === 'number' ? signal.scorecard.founderTeam.score : 7.5,
      max: signal?.scorecard?.founderTeam?.max || 10,
      title: signal?.scorecard?.founderTeam?.title || 'Founder Team & Execution Cadence',
      notes: signal?.scorecard?.founderTeam?.notes || 'Founder velocity and leadership execution cadence evaluated.',
    },
    marketTam: {
      score: typeof signal?.scorecard?.marketTam?.score === 'number' ? signal.scorecard.marketTam.score : 8.0,
      max: signal?.scorecard?.marketTam?.max || 10,
      title: signal?.scorecard?.marketTam?.title || 'Market TAM & Secular Tailwinds',
      notes: signal?.scorecard?.marketTam?.notes || 'Operating in high-velocity category with expansion into enterprise segments.',
    },
    productMoat: {
      score: typeof signal?.scorecard?.productMoat?.score === 'number' ? signal.scorecard.productMoat.score : 6.5,
      max: signal?.scorecard?.productMoat?.max || 10,
      title: signal?.scorecard?.productMoat?.title || 'Product Defensibility & Switching Costs',
      notes: signal?.scorecard?.productMoat?.notes || 'Workflow integration stickiness; audit proprietary data lock-in.',
    },
    unitEconomics: {
      score: typeof signal?.scorecard?.unitEconomics?.score === 'number' ? signal.scorecard.unitEconomics.score : 6.0,
      max: signal?.scorecard?.unitEconomics?.max || 10,
      title: signal?.scorecard?.unitEconomics?.title || 'Unit Economics & Margin Rigor',
      notes: signal?.scorecard?.unitEconomics?.notes || 'Gross margins and customer acquisition costs require rigorous verification.',
    },
    diligenceRisk: {
      score: typeof signal?.scorecard?.diligenceRisk?.score === 'number' ? signal.scorecard.diligenceRisk.score : 5.5,
      max: signal?.scorecard?.diligenceRisk?.max || 10,
      title: signal?.scorecard?.diligenceRisk?.title || 'Execution & Diligence Risk',
      notes: signal?.scorecard?.diligenceRisk?.notes || 'Runway governance and capital allocation discipline required.',
    },
  };

  const safeBaseline = {
    arr: typeof baseline?.arr === 'number' ? baseline.arr : 1.0,
    monthlyBurn: typeof baseline?.monthlyBurn === 'number' ? baseline.monthlyBurn : 0.15,
    runwayMonths: baseline?.runwayMonths ?? 18,
    grossMarginPct: baseline?.grossMarginPct ?? 75,
    blendedCac: baseline?.blendedCac ?? 0,
    salesCycleDays: baseline?.salesCycleDays ?? 60,
    valuationClaim: typeof baseline?.valuationClaim === 'number' ? baseline.valuationClaim : 25,
  };

  const toggleSection = (sectionNum: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionNum)) next.delete(sectionNum);
      else next.add(sectionNum);
      return next;
    });
  };

  const areAllExpanded = expandedSections.size >= 10;
  const toggleAllSections = () => {
    if (areAllExpanded) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    }
  };

  const memoMarkdown = `# INVESTMENT COMMITTEE (IC) DILIGENCE MEMORANDUM
**FIRM CONFIDENTIAL // IC USE ONLY**
**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
**Auditing Partner:** ${currentUser?.displayName || 'Venture Partner'} (${currentUser?.email || 'Institutional Session'})
**Target Company:** ${companyName}
**Sector:** ${sector.replace(/_/g, ' ')} | **Round Stage:** ${stage}
**Deal Terms Proposed:** ${targetRaise} at ${valuationClaim}

---

## 1. TRAFFIC LIGHT INVESTMENT DIRECTIVE & CONVICTION VERDICT
- **Signal:** ${signal?.badgeLabel || signal?.signal || 'CONDITIONAL'}
- **Conviction Score:** ${signal?.convictionScore ?? 75} / 100
- **Lead Partner Directive:** ${signal?.partnerDirective || 'Proceed with structured due diligence'}
- **Executive Summary:** ${signal?.verdictSummary || 'Underwriting assessment completed.'}

### Scenario Analysis
- **Bull Case:** ${signal?.bullCase || 'Market dominance and accelerated expansion.'}
- **Base Case:** ${signal?.baseCase || 'Consistent growth with predictable retention.'}
- **Bear Case:** ${signal?.bearCase || 'Growth deceleration and competitive pressure.'}

---

## 2. 5-DIMENSION SCORECARD RADAR AUDIT
- **Founder & Pedigree:** ${safeScorecard.founderTeam.score}/${safeScorecard.founderTeam.max} — ${safeScorecard.founderTeam.notes}
- **Addressable TAM:** ${safeScorecard.marketTam.score}/${safeScorecard.marketTam.max} — ${safeScorecard.marketTam.notes}
- **Product Moat & IP:** ${safeScorecard.productMoat.score}/${safeScorecard.productMoat.max} — ${safeScorecard.productMoat.notes}
- **Unit Economics:** ${safeScorecard.unitEconomics.score}/${safeScorecard.unitEconomics.max} — ${safeScorecard.unitEconomics.notes}
- **Diligence Risk:** ${safeScorecard.diligenceRisk.score}/${safeScorecard.diligenceRisk.max} — ${safeScorecard.diligenceRisk.notes}

---

## 3. FINANCIAL BASELINE & GROWTH TRAJECTORY
- **Current ARR:** $${safeBaseline.arr.toFixed(2)}M
- **Monthly Net Cash Burn:** $${Math.round(safeBaseline.monthlyBurn * 1000)}k / month
- **Implied Cash Runway:** ${safeBaseline.runwayMonths} months
- **Audited Gross Margin:** ${safeBaseline.grossMarginPct}%
- **Blended CAC:** $${safeBaseline.blendedCac.toLocaleString()}
- **Sales Cycle:** ${safeBaseline.salesCycleDays} days

${historicalQuarters && historicalQuarters.length > 0 ? `
### Historical Quarter Performance
| Quarter | Contracted ARR | Revenue | Gross Profit | Net Burn | NDR |
|---|---|---|---|---|---|
${historicalQuarters.map(hq => `| ${hq.quarter} | $${(hq.arr ?? 0).toFixed(2)}M | $${(hq.revenue ?? 0).toFixed(2)}M | $${(hq.grossProfit ?? 0).toFixed(2)}M | $${(hq.netBurn ?? 0).toFixed(2)}M | ${hq.ndr}% |`).join('\n')}
` : ''}

---

## 4. QUANTITATIVE SCORECARD (vs a16z / Bessemer Standards)
${(metrics || []).map(m => `- **${m.name}:** Reported ${m.reported} (Top-Quartile: ${m.topQuartile} | Status: ${m.status}) — *${m.formula}*`).join('\n')}

---

## 5. VALUATION SENSITIVITY & EFFICIENCY MATRIX
- **Implied ARR Multiple:** ${safeBaseline.arr > 0 ? (safeBaseline.valuationClaim / safeBaseline.arr).toFixed(1) : 'N/A'}x ARR
- **Annualized Burn Multiple:** ${safeBaseline.arr > 0 ? ((safeBaseline.monthlyBurn * 12) / safeBaseline.arr).toFixed(2) : 'N/A'}x
- **Target Raise:** ${targetRaise}

---

## 6. COHORT RETENTION & VELOCITY AUDIT
${cohortDecay && cohortDecay.length > 0 ? `
| Month Cohort | Reported NDR | Top-Quartile Benchmark | Audited Real Retention |
|---|---|---|---|
${cohortDecay.map(cd => `| ${cd.month} | ${cd.reported}% | ${cd.topQuartileBenchmark}% | ${cd.underlyingReal}% |`).join('\n')}
` : 'Cohort retention decay curve unavailable.'}

---

## 7. SUBSECTOR DEEP DIVE AUDIT (${subsectorAudit?.sectorName || sector})
${subsectorAudit?.checks ? subsectorAudit.checks.map((chk, i) => `### 7.${i+1} [${chk.status}] ${chk.pillar}
- **Reported:** ${chk.metricValue} (Target: ${chk.targetBenchmark})
- **Finding:** ${chk.finding}
- **Institutional Risk:** ${chk.institutionalRisk}
`).join('\n') : 'Subsector audit unavailable.'}

---

## 8. FORENSIC DATA GAP AUDIT (DETECTED CONCEALMENTS)
${forensicGaps.map((g, i) => `### 8.${i+1} ${g.title} [${g.severity}]
- **Pitch Deck Claim:** "${g.surfaceClaim}"
- **Diligence Room Reality:** ${g.concealedReality}
- **Valuation Impact:** ${g.financialImpact}
- **Mandatory Remediation:** ${g.remediationAction}
`).join('\n')}

---

## 9. PARTNER DILIGENCE INTERROGATORIES
${questionBank.map((q, i) => `${i+1}. **[${q.cluster}]** "${q.question}"
   - *Strategic Intent:* ${q.intent}
   - *Warning Flag:* ${q.redFlagToWatchFor}`).join('\n\n')}

---

## 10. INVESTMENT COMMITTEE DISPOSITION & EXECUTION
- **Recommendation:** [ ] Issue Term Sheet   [ ] Conditional Follow-Up Diligence   [ ] Pass / Reject Deal
- **Lead Partner Signature:** _________________________________________
- **Date:** ____________________

---
*Generated by Pitch Black Venture Intelligence Terminal*
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(memoMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadICMemoPdf(report);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const modalContent = (
    <div
      id="export-memo-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-memo-modal-title"
    >
      <div
        id="export-memo-modal-container"
        className="bg-white border border-zinc-200/90 rounded-3xl w-full max-w-4xl max-h-[88vh] my-auto flex flex-col shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon (Hidden in print via .no-print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-zinc-200 gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="export-memo-modal-title" className="text-lg font-bold text-zinc-900 font-sans leading-none">
                Investment Committee (IC) Diligence Pack
              </h2>
              <span className="text-xs text-zinc-500 font-medium">
                {companyName} · {stage} · {sector.replace(/_/g, ' ')} · All 9 Pillars
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200" role="tablist" aria-label="Memo Format Switcher">
              <button
                onClick={() => setViewMode('interactive')}
                role="tab"
                aria-selected={viewMode === 'interactive'}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'interactive'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                9 Pillars
              </button>
              <button
                onClick={() => setViewMode('markdown')}
                role="tab"
                aria-selected={viewMode === 'markdown'}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'markdown'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Markdown
              </button>
            </div>

            {/* Expand / Collapse All Toggle (only in interactive mode) */}
            {viewMode === 'interactive' && (
              <button
                onClick={toggleAllSections}
                className="px-2.5 py-1 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors cursor-pointer"
                title={areAllExpanded ? 'Collapse all 9 pillars' : 'Expand all 9 pillars'}
              >
                {areAllExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            )}

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              aria-label="Download Investment Committee PDF memo"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              aria-label="Copy markdown memo to clipboard"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close investment committee memo dialog"
              className="text-zinc-400 hover:text-zinc-900 p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Structured for screen & @media print */}
        <div id="printable-memo-content" className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs leading-relaxed text-zinc-800 space-y-4">
          {viewMode === 'markdown' ? (
            <div className="prose prose-zinc prose-xs max-w-none">
              <ReactMarkdown>{memoMarkdown}</ReactMarkdown>
            </div>
          ) : (
            /* Interactive Collapsible / Expandable Memorandum Sections */
            <div className="space-y-4">
              {/* Memo Meta Card */}
              <div className="bg-zinc-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print-avoid-break">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Compass className="w-3 h-3" />
                    PITCH BLACK // IC CONFIDENTIAL
                  </div>
                  <h1 className="font-extrabold text-white text-lg sm:text-xl leading-tight">
                    {companyName} — Investment Committee Memorandum
                  </h1>
                  <p className="text-zinc-300 text-xs mt-1">
                    Ask: {targetRaise} at {valuationClaim} · Round: {stage} · Sector: {sector.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] text-zinc-400 block">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    STRICTLY CONFIDENTIAL
                  </span>
                </div>
              </div>

              {/* PILLAR 01: Traffic Light Investment Directive */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs print-avoid-break bg-white">
                <button
                  type="button"
                  onClick={() => toggleSection(1)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left cursor-pointer border-b border-zinc-200/80 no-print"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-zinc-900 text-sm">
                      1. Pillar 01: Traffic Light Investment Directive & Conviction Verdict
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                      Score: {signal.convictionScore}/100
                    </span>
                    {expandedSections.has(1) ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                <div className="hidden print:block p-3 bg-zinc-100 border-b border-zinc-300 font-bold text-sm text-zinc-900">
                  1. Pillar 01: Traffic Light Investment Directive & Conviction Verdict (Score: {signal.convictionScore}/100)
                </div>

                {(expandedSections.has(1) || true) && (
                  <div className={`p-4 bg-white space-y-3 text-xs ${!expandedSections.has(1) ? 'hidden print:block' : ''}`}>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                        <span className="text-emerald-800 uppercase font-bold text-[10px] block mb-1">
                          Lead Partner Directive:
                        </span>
                        <p className="font-semibold text-zinc-900 text-xs sm:text-sm">{signal.partnerDirective}</p>
                      </div>
                      <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                        <span className="text-zinc-500 uppercase font-bold text-[10px] block mb-1">
                          Executive Summary:
                        </span>
                        <p className="text-zinc-700">{signal.verdictSummary}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100">
                      <span className="font-bold text-zinc-800 block mb-1.5 uppercase text-[10px] tracking-wider text-zinc-500">
                        Scenario Payoff Waterfall:
                      </span>
                      <div className="grid sm:grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 print-avoid-break">
                          <span className="font-bold text-emerald-800 block text-xs">BULL CASE (Outlier):</span>
                          <p className="text-zinc-700 text-[11px] mt-1">{signal?.bullCase || 'Rapid multi-product expansion and market leadership.'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 print-avoid-break">
                          <span className="font-bold text-blue-800 block text-xs">BASE CASE (Target):</span>
                          <p className="text-zinc-700 text-[11px] mt-1">{signal?.baseCase || 'Steady quota capacity expansion and healthy net retention.'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 print-avoid-break">
                          <span className="font-bold text-rose-800 block text-xs">BEAR CASE (Downside):</span>
                          <p className="text-zinc-700 text-[11px] mt-1">{signal?.bearCase || 'Growth deceleration and competitive pressure on margins.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PILLAR 02: 5-Dimension Scorecard Radar Audit */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs print-avoid-break bg-white">
                <button
                  type="button"
                  onClick={() => toggleSection(2)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left cursor-pointer border-b border-zinc-200/80 no-print"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-zinc-900 text-sm">
                      2. Pillar 02: 5-Dimension Scorecard Radar Audit
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      5 Key Pillars
                    </span>
                    {expandedSections.has(2) ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                <div className="hidden print:block p-3 bg-zinc-100 border-b border-zinc-300 font-bold text-sm text-zinc-900">
                  2. Pillar 02: 5-Dimension Scorecard Radar Audit
                </div>

                {(expandedSections.has(2) || true) && (
                  <div className={`p-4 bg-white space-y-2 text-xs ${!expandedSections.has(2) ? 'hidden print:block' : ''}`}>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {[
                        { key: 'Founder Pedigree & Team', factor: safeScorecard.founderTeam },
                        { key: 'Addressable TAM & Market', factor: safeScorecard.marketTam },
                        { key: 'Product Defensibility & Moat', factor: safeScorecard.productMoat },
                        { key: 'Unit Economics & Margins', factor: safeScorecard.unitEconomics },
                        { key: 'Execution & Diligence Risk', factor: safeScorecard.diligenceRisk },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 print-avoid-break">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-zinc-900">{item.key}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                              (item.factor.score ?? 0) >= 7 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              (item.factor.score ?? 0) >= 5 ? 'bg-blue-50 text-blue-800 border-blue-300' :
                              'bg-rose-50 text-rose-700 border-rose-300'
                            }`}>
                              {item.factor.score} / {item.factor.max}
                            </span>
                          </div>
                          <p className="text-zinc-600 text-[11px] leading-relaxed">{item.factor.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PILLAR 03: Financial Baseline & Historical Trajectory */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs print-avoid-break bg-white">
                <button
                  type="button"
                  onClick={() => toggleSection(3)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left cursor-pointer border-b border-zinc-200/80 no-print"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-zinc-900 text-sm">
                      3. Pillar 03: Financial Baseline & Operating Vitals
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      ARR: ${safeBaseline.arr}M
                    </span>
                    {expandedSections.has(3) ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                <div className="hidden print:block p-3 bg-zinc-100 border-b border-zinc-300 font-bold text-sm text-zinc-900">
                  3. Pillar 03: Financial Baseline & Operating Vitals
                </div>

                {(expandedSections.has(3) || true) && (
                  <div className={`p-4 bg-white space-y-3 text-xs ${!expandedSections.has(3) ? 'hidden print:block' : ''}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Ending ARR</span>
                        <div className="font-bold text-base text-emerald-600">${safeBaseline.arr}M</div>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Monthly Burn</span>
                        <div className="font-bold text-base text-zinc-900">${Math.round(safeBaseline.monthlyBurn * 1000)}k/mo</div>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Cash Runway</span>
                        <div className="font-bold text-base text-blue-600">{safeBaseline.runwayMonths} months</div>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Gross Margin</span>
                        <div className="font-bold text-base text-purple-600">{safeBaseline.grossMarginPct}%</div>
                      </div>
                    </div>

                    {historicalQuarters && historicalQuarters.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100 print-avoid-break">
                        <span className="font-bold text-zinc-800 block mb-2 text-xs">Historical Performance Audit (Quarter-by-Quarter):</span>
                        <div className="overflow-x-auto rounded-xl border border-zinc-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-bold">
                                <th className="p-2">Quarter</th>
                                <th className="p-2">Contracted ARR</th>
                                <th className="p-2">Revenue</th>
                                <th className="p-2">Gross Profit</th>
                                <th className="p-2">Net Burn</th>
                                <th className="p-2">NDR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historicalQuarters.map((hq, idx) => (
                                <tr key={idx} className="border-b border-zinc-100 even:bg-zinc-50">
                                  <td className="p-2 font-bold text-zinc-900">{hq.quarter}</td>
                                  <td className="p-2 text-zinc-800">${hq.arr.toFixed(2)}M</td>
                                  <td className="p-2 text-zinc-800">${hq.revenue.toFixed(2)}M</td>
                                  <td className="p-2 text-zinc-800">${hq.grossProfit.toFixed(2)}M</td>
                                  <td className="p-2 text-zinc-800">${hq.netBurn.toFixed(2)}M</td>
                                  <td className="p-2 font-semibold text-emerald-700">{hq.ndr}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PILLAR 04: Quantitative Metric Benchmarks */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs print-avoid-break bg-white">
                <button
                  type="button"
                  onClick={() => toggleSection(4)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left cursor-pointer border-b border-zinc-200/80 no-print"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-zinc-900 text-sm">
                      4. Pillar 04: Quantitative Metric Benchmarks Scorecard (vs a16z / Bessemer)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {metrics.length} Metrics
                    </span>
                    {expandedSections.has(4) ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                <div className="hidden print:block p-3 bg-zinc-100 border-b border-zinc-300 font-bold text-sm text-zinc-900">
                  4. Pillar 04: Quantitative Metric Benchmarks Scorecard (vs a16z / Bessemer)
                </div>

                {(expandedSections.has(4) || true) && (
                  <div className={`p-4 bg-white space-y-2 text-xs ${!expandedSections.has(4) ? 'hidden print:block' : ''}`}>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {metrics.map((m) => (
                        <div key={m.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between print-avoid-break">
                          <div>
                            <span className="font-bold text-zinc-900 block">{m.name}</span>
                            <div className="text-[11px] text-zinc-500">Reported: <strong className="text-zinc-800">{m.reported}</strong> (Target: {m.topQuartile})</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                            m.status === 'TOP_QUARTILE' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            m.status === 'MEDIAN' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                            'bg-rose-50 text-rose-700 border-rose-300'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PILLAR 05: Valuation Sensitivity & Capital Efficiency */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs print-avoid-break bg-white">
                <button
                  type="button"
                  onClick={() => toggleSection(5)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left cursor-pointer border-b border-zinc-200/80 no-print"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-zinc-900 text-sm">
                      5. Pillar 05: Valuation Sensitivity & Efficiency Matrix
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {safeBaseline.arr > 0 ? (safeBaseline.valuationClaim / safeBaseline.arr).toFixed(1) : 'N/A'}x ARR
                    </span>
                    {expandedSections.has(5) ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                <div className="hidden print:block p-3 bg-zinc-100 border-b border-zinc-300 font-bold text-sm text-zinc-900">
                  5. Pillar 05: Valuation Sensitivity & Efficiency Matrix
                </div>

                {(expandedSections.has(5) || true) && (
                  <div className={`p-4 bg-white space-y-3 text-xs ${!expandedSections.has(5) ? 'hidden print:block' : ''}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 print-avoid-break">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Implied Multiple</span>
                        <div className="font-bold text-base text-zinc-900">{safeBaseline.arr > 0 ? (safeBaseline.valuationClaim / safeBaseline.arr).toFixed(1) : 'N/A'}x ARR</div>
                        <span className="text-[10px] text-zinc-500">At ${safeBaseline.valuationClaim}M claim</span>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 print-avoid-break">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Burn Multiple</span>
                        <div className="font-bold text-base text-zinc-900">{safeBaseline.arr > 0 ? ((safeBaseline.monthlyBurn * 12) / safeBaseline.arr).toFixed(2) : 'N/A'}x</div>
                        <span className="text-[10px] text-zinc-500">Net Burn / Added ARR</span>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 print-avoid-break">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Blended CAC</span>
                        <div className="font-bold text-base text-zinc-900">${safeBaseline.blendedCac.toLocaleString()}</div>
                        <span className="text-[10px] text-zinc-500">Acquisition cost</span>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 print-avoid-break">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Sales Cycle</span>
                        <div className="font-bold text-base text-zinc-900">{safeBaseline.salesCycleDays} Days</div>
                        <span className="text-[10px] text-zinc-500">Enterprise close speed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PILLAR 06: Cohort Retention & Velocity Trajectory */}
              {cohortDecay && cohortDecay.length > 0 && (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs print-avoid-break bg-white">
                  <button
                    type="button"
                    onClick={() => toggleSection(6)}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left cursor-pointer border-b border-zinc-200/80 no-print"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-zinc-900 text-sm">
                        6. Pillar 06: Cohort Retention & Growth Velocity Decay
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {cohortDecay.length} Months Tracked
                      </span>
                      {expandedSections.has(6) ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                  </button>

                  <div className="hidden print:block p-3 bg-zinc-100 border-b border-zinc-300 font-bold text-sm text-zinc-900">
                    6. Pillar 06: Cohort Retention & Growth Velocity Decay
                  </div>

                  {(expandedSections.has(6) || true) && (
                    <div className={`p-4 bg-white space-y-2 text-xs ${!expandedSections.has(6) ? 'hidden print:block' : ''}`}>
                      <div className="overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-bold">
                              <th className="p-2">Month Cohort</th>
                              <th className="p-2">Reported NDR (%)</th>
                              <th className="p-2">Top-Quartile Benchmark (%)</th>
                              <th className="p-2">Audited Real Retention (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cohortDecay.map((cd, idx) => {
                              const isDivergent = Math.abs(cd.reported - cd.underlyingReal) > 10;
                              return (
                                <tr key={idx} className="border-b border-zinc-100 even:bg-zinc-50">
                                  <td className="p-2 font-bold text-zinc-900">{cd.month}</td>
                                  <td className="p-2 text-zinc-800">{cd.reported}%</td>
                                  <td className="p-2 text-zinc-600">{cd.topQuartileBenchmark}%</td>
                                  <td className={`p-2 font-bold ${isDivergent ? 'text-rose-600' : 'text-zinc-900'}`}>
                                    {cd.underlyingReal}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PILLAR 07: Subsector Deep Dive Audit */}
              {subsectorAudit && subsectorAudit.checks && (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs print-avoid-break bg-white">
                  <button
                    type="button"
                    onClick={() => toggleSection(7)}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left cursor-pointer border-b border-zinc-200/80 no-print"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-zinc-900 text-sm">
                        7. Pillar 07: Subsector Deep Dive Audit ({subsectorAudit.sectorName || sector})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {subsectorAudit.checks.length} Checks
                      </span>
                      {expandedSections.has(7) ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                  </button>

                  <div className="hidden print:block p-3 bg-zinc-100 border-b border-zinc-300 font-bold text-sm text-zinc-900">
                    7. Pillar 07: Subsector Deep Dive Audit ({subsectorAudit.sectorName || sector})
                  </div>

                  {(expandedSections.has(7) || true) && (
                    <div className={`p-4 bg-white space-y-2 text-xs ${!expandedSections.has(7) ? 'hidden print:block' : ''}`}>
                      {subsectorAudit.checks.map((chk, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border print-avoid-break ${
                            chk.status === 'PASS' ? 'bg-emerald-50/40 border-emerald-200' :
                            chk.status === 'FLAG' ? 'bg-amber-50/40 border-amber-200' :
                            'bg-rose-50/40 border-rose-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-zinc-900">7.{idx + 1} {chk.pillar}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              chk.status === 'PASS' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              chk.status === 'FLAG' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              'bg-rose-100 text-rose-700 border-rose-300'
                            }`}>
                              [{chk.status}]
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mb-1">
                            Reported: <strong className="text-zinc-800">{chk.metricValue}</strong> (Target: {chk.targetBenchmark})
                          </div>
                          <p className="text-zinc-700 text-xs mb-1">{chk.finding}</p>
                          <p className="text-rose-700 text-[11px] font-semibold">Institutional Risk: {chk.institutionalRisk}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PILLAR 08: Forensic Data Gaps */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs print-avoid-break bg-white">
                <button
                  type="button"
                  onClick={() => toggleSection(8)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left cursor-pointer border-b border-zinc-200/80 no-print"
                >
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-zinc-900 text-sm">
                      8. Pillar 08: Forensic Data Gap Audit & Concealments
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      {forensicGaps.length} Flags Detected
                    </span>
                    {expandedSections.has(8) ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                <div className="hidden print:block p-3 bg-zinc-100 border-b border-zinc-300 font-bold text-sm text-zinc-900">
                  8. Pillar 08: Forensic Data Gap Audit & Concealments
                </div>

                {(expandedSections.has(8) || true) && (
                  <div className={`p-4 bg-white space-y-3 text-xs ${!expandedSections.has(8) ? 'hidden print:block' : ''}`}>
                    {forensicGaps.map((g, idx) => (
                      <div key={g.id || idx} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5 print-avoid-break">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900">8.{idx + 1} {g.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            g.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            g.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}>
                            [{g.severity}]
                          </span>
                        </div>
                        <p className="text-zinc-600 italic">"{g.surfaceClaim}"</p>
                        <p className="text-rose-950 font-medium bg-rose-50/70 p-2.5 rounded-lg border border-rose-200">
                          <strong>Reality:</strong> {g.concealedReality}
                        </p>
                        <div className="text-[11px] text-zinc-600 pt-1">
                          <strong className="text-rose-700">Valuation Impact:</strong> {g.financialImpact} — <em>{g.remediationAction}</em>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PILLAR 09: Partner Diligence Interrogatories */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs print-avoid-break bg-white">
                <button
                  type="button"
                  onClick={() => toggleSection(9)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left cursor-pointer border-b border-zinc-200/80 no-print"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-zinc-900 text-sm">
                      9. Pillar 09: Partner Diligence Interrogatories & Red Flag Triggers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {questionBank.length} Questions
                    </span>
                    {expandedSections.has(9) ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                <div className="hidden print:block p-3 bg-zinc-100 border-b border-zinc-300 font-bold text-sm text-zinc-900">
                  9. Pillar 09: Partner Diligence Interrogatories & Red Flag Triggers
                </div>

                {(expandedSections.has(9) || true) && (
                  <div className={`p-4 bg-white space-y-2.5 text-xs ${!expandedSections.has(9) ? 'hidden print:block' : ''}`}>
                    {questionBank.map((q, idx) => (
                      <div key={q.id || idx} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 print-avoid-break">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">Q{idx + 1}.</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {q.cluster}
                          </span>
                        </div>
                        <p className="font-bold text-zinc-900 text-xs sm:text-sm">"{q.question}"</p>
                        <p className="text-zinc-600 text-[11px]"><strong>Strategic Intent:</strong> {q.intent}</p>
                        <p className="text-rose-700 text-[11px] font-semibold"><strong>[FLAG] Warning Indicator:</strong> {q.redFlagToWatchFor}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 10: IC Disposition & Sign-Off Matrix */}
              <div className="border-2 border-zinc-900 rounded-2xl p-5 bg-zinc-50 print-avoid-break">
                <span className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider block mb-2">
                  10. Investment Committee Disposition & Execution Sign-Off
                </span>
                <p className="text-xs text-zinc-600 mb-4">
                  Formal IC Disposition: &nbsp;&nbsp;
                  <span className="font-semibold text-zinc-800">[ &nbsp; ] Issue Term Sheet</span> &nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="font-semibold text-zinc-800">[ &nbsp; ] Conditional Follow-Up Diligence</span> &nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="font-semibold text-zinc-800">[ &nbsp; ] Pass / Reject Deal</span>
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-zinc-200">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold mb-1">Lead Partner Signature:</span>
                    <div className="border-b-2 border-zinc-400 h-7" />
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold mb-1">Date of Disposition:</span>
                    <div className="border-b-2 border-zinc-400 h-7" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
