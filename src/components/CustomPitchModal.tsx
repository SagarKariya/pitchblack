import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface CustomPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAudit: (pitchText: string, sector?: string, companyName?: string) => Promise<void>;
  isLoading: boolean;
}

export const CustomPitchModal: React.FC<CustomPitchModalProps> = ({
  isOpen,
  onClose,
  onRunAudit,
  isLoading,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState<string>('ENTERPRISE_AI');
  const [pitchText, setPitchText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitchText.trim()) return;
    await onRunAudit(pitchText, sector, companyName);
  };

  const handleSampleFill = () => {
    setCompanyName('CyberSentinel AI');
    setSector('ENTERPRISE_AI');
    setPitchText(`CyberSentinel AI — Series A Teaser Deck
ARR: $2,800,000 | Growth: 190% YoY | Team: 14 FTEs (ex-CrowdStrike, MIT CSAIL)
Autonomous agentic SOC Tier-1 incident response platform.
Customers: 26 mid-market enterprise security teams.
Metrics reported:
- ARR: $2.8M (growing at 14% MoM)
- NDR: 135% (reported on initial 8 cohorts)
- Gross Churn: 1.1% monthly
- Blended CAC: $16,400 (payback claimed 5.2 months)
- Cash: $1.9M | Monthly Burn: $210,000 | Implied Runway: 9.0 months
- Claimed Gross Margin: 81%
- Infrastructure: Fine-tuned Llama-3 + proprietary cyber threat graph
Ask: Raising $12M Series A at $50M pre-money valuation.`);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-pitch-modal-title"
    >
      <div
        className="bg-white border border-zinc-200/90 rounded-3xl w-full max-w-2xl max-h-[88vh] my-auto overflow-y-auto shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-900 p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 id="custom-pitch-modal-title" className="text-xl font-bold text-zinc-900 font-sans">
            Ingest Startup Pitch / Raw Due Diligence Data
          </h2>
        </div>
        <p className="text-xs text-zinc-600 mb-6">
          Paste pitch deck transcripts, investor teasers, financial metrics, or customer notes. The institutional diligence engine will audit all 9 VC pillars.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="custom-company-name-input" className="block text-xs text-zinc-700 font-semibold mb-1">
                Company Name (Optional)
              </label>
              <input
                id="custom-company-name-input"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. CyberSentinel AI"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label htmlFor="custom-sector-select" className="block text-xs text-zinc-700 font-semibold mb-1">
                Subsector Lens
              </label>
              <select
                id="custom-sector-select"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
              >
                <option value="ENTERPRISE_AI">Enterprise AI & Autonomous Agents</option>
                <option value="FINTECH">Fintech & Embedded Payments</option>
                <option value="HEALTHTECH">HealthTech & Remote Telemetry (RPM)</option>
                <option value="IOT_HAAS">Connected Devices, IoT & HaaS</option>
                <option value="GENERAL_SAAS">General B2B SaaS</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="custom-pitch-textarea" className="block text-xs text-zinc-700 font-semibold">
                Pitch Transcript / Deck Notes / Financial Summary:
              </label>
              <button
                type="button"
                onClick={handleSampleFill}
                className="text-xs text-emerald-700 hover:underline cursor-pointer font-medium"
              >
                Fill with Sample Teaser
              </button>
            </div>
            <textarea
              id="custom-pitch-textarea"
              rows={8}
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Paste raw pitch text, financial highlights, ARR, cash, burn rate, customer count, CAC, team backgrounds, or deal room notes..."
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 leading-relaxed font-mono"
              required
            />
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className={pitchText.trim().length > 0 && pitchText.trim().length < 100 ? "text-amber-600 font-medium" : "text-zinc-500"}>
                {pitchText.trim().length < 100
                  ? `${pitchText.trim().length}/100 min chars required`
                  : `${pitchText.length.toLocaleString()} / 60,000 characters`}
              </span>
              <span className="text-zinc-400">Max 60k chars</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
            <span className="text-xs text-zinc-500">
              Powered by Gemini & a16z 16 Metrics Standards
            </span>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs rounded-xl transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || pitchText.trim().length < 100 || pitchText.trim().length > 60000}
                className="px-5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Auditing Diligence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Run Institutional Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
