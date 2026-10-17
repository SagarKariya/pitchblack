import React, { useState } from 'react';
import { FullDiligenceReport } from '../types';
import {
  Copy,
  Check,
  Target,
  Flag,
  HelpCircle,
} from 'lucide-react';

interface QuestionBankPillarProps {
  report: FullDiligenceReport;
}

export const QuestionBankPillar: React.FC<QuestionBankPillarProps> = ({ report }) => {
  const { questionBank } = report;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyQuestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const uniqueClusters = Array.from(new Set(questionBank.map((q) => q.cluster))).length;

  return (
    <div className="space-y-6">
      {/* Pillar 09 Banner Header - Institutional Visual Similarity */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                Pillar 09 · Questions to Ask
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-3xl leading-relaxed">
              Founder due diligence agenda and pressure-testing precision questions designed to test founder truthfulness, expose hidden unit economics, and test technological moat defensibility before issuing term sheets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl shadow-xs self-start md:self-auto shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Agenda Dossier</div>
              <span className="text-xs font-bold text-zinc-900">
                {questionBank.length} Strategic Prompts
              </span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-100">
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-zinc-500 block">Total Questions Prepared</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums">
              {questionBank.length} Tailored Prompts
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-amber-700 block">Thematic Categories</span>
            <div className="text-lg font-black text-amber-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {uniqueClusters}
              <span className="text-[11px] font-normal text-zinc-500">Core Verticals</span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-blue-700 block">Interview Target</span>
            <div className="text-sm font-bold text-blue-700 mt-0.5 truncate">
              Founders & Executive Team
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-emerald-700 block">Primary Diligence Focus</span>
            <div className="text-sm font-bold text-emerald-700 mt-0.5 truncate">
              Founder Truth & Moat Testing
            </div>
          </div>
        </div>
      </div>

      {/* Question Cards (Always Fully Expanded) */}
      <div className="space-y-4">
        {questionBank.map((q, idx) => {
          const qId = q.id || String(idx);

          return (
            <div
              key={qId}
              className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 hover:border-zinc-300 transition-all shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 tabular-nums text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      {q.cluster}
                    </span>
                    <p className="text-sm lg:text-base font-bold text-zinc-900 mt-2 leading-relaxed">
                      "{q.question}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <button
                    onClick={() => handleCopyQuestion(q.question, qId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-xs rounded-lg border border-zinc-200 transition-colors cursor-pointer"
                    title="Copy Question"
                  >
                    {copiedId === qId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Strategic Intent and Red Flag Breakdown (Always Expanded) */}
              <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                {/* Strategic Diligence Intent */}
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4">
                  <div className="text-[11px] uppercase font-bold text-blue-700 mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    Strategic Diligence Intent (Why We Ask):
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    {q.intent}
                  </p>
                </div>

                {/* Red Flag to Watch For */}
                <div className="bg-rose-50/40 border border-rose-200/70 rounded-xl p-4">
                  <div className="text-[11px] uppercase font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-rose-600" />
                    Red Flag To Disqualify / Pause Deal:
                  </div>
                  <p className="text-xs text-rose-950/90 leading-relaxed font-medium">
                    {q.redFlagToWatchFor}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
