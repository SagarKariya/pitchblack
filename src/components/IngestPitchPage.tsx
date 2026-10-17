import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Target,
  DollarSign,
  Layers,
  Cpu,
  Stethoscope,
  CreditCard,
  Radio,
  ArrowRight,
  Loader2,
  HelpCircle,
  Trash2,
  Calendar,
  Flame,
  Scale,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface IngestPitchPageProps {
  onRunAudit: (pitchText: string, sector?: string, companyName?: string, stage?: string) => Promise<void>;
  isLoading: boolean;
  isLoggedIn?: boolean;
  onOpenAuth?: (prompt?: string) => void;
}

export type DiligenceSector = 'ENTERPRISE_AI' | 'FINTECH' | 'HEALTHTECH' | 'IOT_HAAS' | 'GENERAL_SAAS';

interface SamplePreset {
  id: string;
  name: string;
  stage: string;
  sector: DiligenceSector;
  tagline: string;
  companyName: string;
  targetAsk: string;
  valuationClaim: string;
  arr: string;
  burn: string;
  runway: string;
  pitchText: string;
}

const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'healthtech-series-a',
    name: 'NeuroPulse Health',
    stage: 'Series A',
    sector: 'HEALTHTECH',
    tagline: 'Remote Cardiac Telemetry & FDA 510(k) Arrhythmia AI',
    companyName: 'NeuroPulse Health',
    targetAsk: '$10M',
    valuationClaim: '$42M Pre-Money',
    arr: '2.4',
    burn: '180',
    runway: '11',
    pitchText: `Company: NeuroPulse Health
Stage: Series A
Sector: Healthcare / Remote Patient Monitoring (RPM)
Overview: Continuous clinical-grade ECG wearable with edge AI arrhythmia classification.
Target Raise: $10M Series A at $42M pre-money valuation ($52M post-money).

Traction & Financial Highlights:
- Contracted ARR: $2.4M (growing 175% YoY across 24 health system contracts)
- Net Dollar Retention (NDR): 128% (driven by clinic bed expansion)
- Cash on Hand: $1.6M | Monthly Net Burn: $180,000 | Implied Runway: 11 months
- Claimed Gross Margin: 74% (hardware sensor kit COGS amortized over 2-year hospital contract)
- Blended CAC: $24,500 with CAC Payback of 10.5 months
- Sales Cycle: 125 days across regional integrated delivery networks (IDNs)

Regulatory & Moat:
- FDA 510(k) clearance granted for Class II diagnostic algorithms.
- Reimbursed under Medicare Remote Patient Monitoring CPT Codes: 99453 (initial setup), 99454 (monthly transmission), and 99457 (clinical management).
- Clinical trials published in Journal of the American College of Cardiology demonstrating 98.4% sensitivity.
- Team: 18 FTEs led by ex-Medtronic R&D Director and Stanford Cardiology Fellowship Chair.`,
  },
  {
    id: 'enterprise-ai-seed',
    name: 'CognitiveKernel AI',
    stage: 'Series A',
    sector: 'ENTERPRISE_AI',
    tagline: 'Autonomous SOC Tier-1 Agentic Cyber Defense Platform',
    companyName: 'CognitiveKernel AI',
    targetAsk: '$14M',
    valuationClaim: '$52M Pre-Money',
    arr: '3.1',
    burn: '240',
    runway: '10',
    pitchText: `Company: CognitiveKernel AI
Stage: Series A
Sector: Enterprise AI & Autonomous Cybersecurity Agents
Overview: Autonomous agentic security operations center (SOC) that investigates, triages, and remediates Tier-1 alerts in under 45 seconds without human analyst fatigue.
Target Raise: $14M Series A at $52M pre-money valuation.

Financials & Performance:
- Contracted ARR: $3.1M (190% YoY velocity across 32 enterprise accounts)
- Net Revenue Retention (NRR): 134%
- Monthly Net Burn: $240,000 | Cash on Hand: $2.4M | Runway: 10 months
- Claimed Gross Margin: 81%
- Customer Base: 32 mid-market and Fortune 1000 SOC teams
- LTV:CAC Ratio: 4.8x | Blended CAC: $18,200 (payback 5.4 months)
- AI Infrastructure: Fine-tuned open-weights Llama-3 + proprietary cyber threat graph. Zero dependency on closed OpenAI raw API passthroughs.
- Team: 16 engineers ex-CrowdStrike, Mandiant, and MIT CSAIL.`,
  },
  {
    id: 'fintech-series-b',
    name: 'VaultFlow Global',
    stage: 'Series B',
    sector: 'FINTECH',
    tagline: 'Cross-Border Real-Time B2B Settlement & Treasury API',
    companyName: 'VaultFlow Global',
    targetAsk: '$22M',
    valuationClaim: '$110M Pre-Money',
    arr: '5.2',
    burn: '350',
    runway: '14',
    pitchText: `Company: VaultFlow Global
Stage: Series B
Sector: Fintech & Embedded Payments
Overview: Real-time multi-currency settlement rails and treasury APIs for global platforms and cross-border marketplaces.
Target Raise: $22M Series B at $110M pre-money valuation.

Financial Architecture:
- Annualized TPV (Gross Volume): $180,000,000
- Pure Contracted ARR: $5.2M (Subscription access fee + volume tiers)
- Net Take Rate: 2.15% on non-USD corridors (Gross margin on payments: 68%)
- Growth Velocity: 145% YoY
- Cash on Hand: $4.9M | Monthly Burn: $350,000 | Runway: 14 months
- Regulatory: Dual sponsor-bank routing architecture (Cross River Bank & Evolve), registered MSB with FinCEN, SOC2 Type II and PCI-DSS Level 1 certified.
- Customer Concentration: Top 3 clients represent 22% of total TPV.
- Team: 35 employees across San Francisco and London (ex-Stripe, Adyen, Wise).`,
  },
  {
    id: 'iot-series-a',
    name: 'SensorGrid Dynamics',
    stage: 'Series A',
    sector: 'IOT_HAAS',
    tagline: 'Predictive Turbine & Industrial Vibration Telemetry (HaaS)',
    companyName: 'SensorGrid Dynamics',
    targetAsk: '$8M',
    valuationClaim: '$35M Pre-Money',
    arr: '1.8',
    burn: '160',
    runway: '12',
    pitchText: `Company: SensorGrid Dynamics
Stage: Series A
Sector: Connected Devices, IoT & Hardware-as-a-Service (HaaS)
Overview: Self-powered wireless vibration & acoustic telemetry nodes for predictive maintenance in wind energy, paper mills, and petrochemical plants.
Target Raise: $8M Series A at $35M pre-money valuation.

Operational Metrics:
- Contracted ARR: $1.8M (100% recurring software & telemetry monitoring fees)
- Deployed Sensor Nodes: 14,200 active nodes across 48 manufacturing plants
- Hardware Attach Rate: 94% customers on 36-month non-cancelable HaaS lease agreements
- Hardware Unit BOM: $64 per node (amortized in month 2 of deployment)
- Factory RMA Defect Rate: 0.8%
- Cash on Hand: $1.9M | Monthly Burn: $160,000 | Cash Runway: 12 months
- Annual Logo Churn: 2.1% | Net Expansion: 122%
- Team: 14 FTEs (ex-Honeywell, Siemens Energy, and ABB Robotics).`,
  },
];

const STAGES = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth'];

export const IngestPitchPage: React.FC<IngestPitchPageProps> = ({
  onRunAudit,
  isLoading,
  isLoggedIn = false,
  onOpenAuth,
}) => {
  const [companyName, setCompanyName] = useState<string>('');
  const [stage, setStage] = useState<string>('Series A');
  const [sector, setSector] = useState<DiligenceSector>('HEALTHTECH');
  const [targetAsk, setTargetAsk] = useState<string>('');
  const [valuationClaim, setValuationClaim] = useState<string>('');
  const [arr, setArr] = useState<string>('');
  const [burn, setBurn] = useState<string>('');
  const [runway, setRunway] = useState<string>('');
  const [pitchText, setPitchText] = useState<string>('');
  
  // File upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyPreset = (preset: SamplePreset) => {
    setCompanyName(preset.companyName);
    setStage(preset.stage);
    setSector(preset.sector);
    setTargetAsk(preset.targetAsk);
    setValuationClaim(preset.valuationClaim);
    setArr(preset.arr);
    setBurn(preset.burn);
    setRunway(preset.runway);
    setPitchText(preset.pitchText);
    setUploadedFileName(null);
    setUploadStatusMessage(`Loaded institutional teaser for ${preset.name} (${preset.stage} · ${preset.sector})`);
  };

  const handleResetForm = () => {
    setCompanyName('');
    setStage('Series A');
    setSector('HEALTHTECH');
    setTargetAsk('');
    setValuationClaim('');
    setArr('');
    setBurn('');
    setRunway('');
    setPitchText('');
    setUploadedFileName(null);
    setUploadStatusMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processUploadedFile = (file: File) => {
    setUploadedFileName(file.name);
    setUploadStatusMessage(`Extracting content from ${file.name}...`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.trim().length > 0) {
        // If file content exists, append or set as pitch text
        let combinedText = text;
        if (!companyName) {
          // Attempt simple name extraction from filename
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setCompanyName(cleanName);
        }
        setPitchText(combinedText);
        const wordCount = combinedText.trim().split(/\s+/).length;
        setUploadStatusMessage(`Successfully extracted ${wordCount.toLocaleString()} words from "${file.name}"`);
      } else {
        setUploadStatusMessage(`Extracted file "${file.name}", but content was empty.`);
      }
    };

    reader.onerror = () => {
      setUploadStatusMessage(`Failed to parse file "${file.name}". Please paste text directly.`);
    };

    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn && onOpenAuth) {
      onOpenAuth('Sign in with your Google or investor account to execute real-time AI diligence audits.');
      return;
    }

    if (!pitchText.trim()) return;

    // Build synthesized context if user filled the numeric inputs but not in text
    let completePitchText = pitchText;
    const additionalMeta: string[] = [];
    if (companyName && !pitchText.includes(companyName)) additionalMeta.push(`Company: ${companyName}`);
    if (stage && !pitchText.includes(stage)) additionalMeta.push(`Stage: ${stage}`);
    if (sector && !pitchText.includes(sector)) additionalMeta.push(`Sector Lens: ${sector}`);
    if (targetAsk && !pitchText.includes(targetAsk)) additionalMeta.push(`Target Ask: ${targetAsk}`);
    if (valuationClaim && !pitchText.includes(valuationClaim)) additionalMeta.push(`Valuation Claim: ${valuationClaim}`);
    if (arr && !pitchText.toLowerCase().includes('arr')) additionalMeta.push(`ARR: $${arr}M`);
    if (burn && !pitchText.toLowerCase().includes('burn')) additionalMeta.push(`Monthly Net Burn: $${burn}k/mo`);
    if (runway && !pitchText.toLowerCase().includes('runway')) additionalMeta.push(`Cash Runway: ${runway} months`);

    if (additionalMeta.length > 0) {
      completePitchText = `${additionalMeta.join(' | ')}\n\n${pitchText}`;
    }

    await onRunAudit(completePitchText, sector, companyName || 'Target Venture Candidate', stage);
  };

  const wordCount = pitchText.trim() ? pitchText.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header Banner */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Institutional Pitch Ingestion & AI Diligence Audit</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight font-serif">
          Ingest Startup Pitch & Launch Due Diligence
        </h1>
        <p className="text-sm text-zinc-600 max-w-3xl mt-2 leading-relaxed">
          Upload pitch deck transcripts, financial models, raw executive summaries, or partner meeting notes. 
          Our AI Diligence Director audits the deal across <strong>9 VC Pillars</strong>: investment conviction verdict, 5-factor scorecard radar, financial baseline trajectory, a16z 16 metric benchmarks, valuation stress testing, cohort velocity decay, subsector regulatory hurdles, forensic omission detection, and partner diligence interrogatories.
        </p>
      </div>

      {/* Guest Mode Notice */}
      {!isLoggedIn && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Guest Diligence Mode:</strong> Pitch ingestion templates, rubrics, and samples are open for exploration. Sign in to execute real-time AI audits and generate 9-pillar packs.
            </span>
          </div>
          {onOpenAuth && (
            <button
              type="button"
              onClick={() => onOpenAuth('Sign in with your investor account to execute real-time AI diligence audits.')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Sign In to Run Audits
            </button>
          )}
        </div>
      )}

      {/* Preset Teasers Bar (One-click Loading) */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-xs uppercase font-bold text-zinc-700 tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Load Verified Institutional Diligence Teaser:</span>
          </div>
          <span className="text-xs text-zinc-500">
            Click any deal below to pre-populate full quantitative metrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_PRESETS.map((preset) => {
            const isCurrent = companyName === preset.companyName;
            return (
              <button
                type="button"
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-800">
                      {preset.stage}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      ${preset.arr}M ARR
                    </span>
                  </div>
                  <div className="text-xs font-bold text-zinc-900 truncate">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    {preset.tagline}
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-zinc-200/60 text-[10px] font-semibold text-emerald-700 flex items-center justify-between">
                  <span>Load Teaser</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Startup Profile & Diligence Parameters */}
          <div className="lg:col-span-5 space-y-5">
            {/* Metadata Card */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-zinc-900">Startup Profile & Stage</h2>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="ingest-company-name" className="block text-xs font-semibold text-zinc-800 mb-1">
                  Company / Startup Name
                </label>
                <input
                  id="ingest-company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. NeuroPulse Health, CyberSentinel, VaultFlow..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Startup Category / Round Stage */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Investment Round / Stage
                </label>
                <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Investment round stage options">
                  {STAGES.map((stg) => (
                    <button
                      type="button"
                      key={stg}
                      onClick={() => setStage(stg)}
                      aria-pressed={stage === stg}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        stage === stg
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subsector Diligence Lens */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Subsector Diligence Lens
                </label>
                <div className="space-y-2" role="radiogroup" aria-label="Subsector Diligence Lens Selection">
                  {[
                    { id: 'HEALTHTECH', label: 'Healthcare & HealthTech (RPM/FDA)', icon: Stethoscope, desc: 'FDA 510(k), CPT codes 99453/99454, procurement cycle' },
                    { id: 'ENTERPRISE_AI', label: 'Enterprise AI & Autonomous Agents', icon: Cpu, desc: 'GPU compute margin, inference moat, agentic autonomy' },
                    { id: 'FINTECH', label: 'Fintech & Embedded Payments', icon: CreditCard, desc: 'TPV take-rate, sponsor banks, delinquency & PCI' },
                    { id: 'IOT_HAAS', label: 'Connected Devices & HaaS', icon: Radio, desc: 'BOM margins, factory RMA defect rate, recurring attach' },
                    { id: 'GENERAL_SAAS', label: 'General B2B SaaS', icon: Layers, desc: 'Rule of 40, Magic Number, Net Dollar Retention' },
                  ].map((sec) => {
                    const Icon = sec.icon;
                    const isSelected = sector === sec.id;
                    return (
                      <div
                        key={sec.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setSector(sec.id as DiligenceSector); } }}
                        onClick={() => setSector(sec.id as DiligenceSector)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-500/20'
                            : 'bg-zinc-50/60 border-zinc-200 hover:bg-white hover:border-zinc-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-900' : 'text-zinc-900'}`}>
                            {sec.label}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {sec.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Financial Parameters (Optional Quick Bounds) */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-zinc-900">Deal Terms & Target Metrics (Optional)</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ingest-target-ask" className="block text-xs font-semibold text-zinc-700 mb-1">
                    Target Ask ($)
                  </label>
                  <input
                    id="ingest-target-ask"
                    type="text"
                    value={targetAsk}
                    onChange={(e) => setTargetAsk(e.target.value)}
                    placeholder="e.g. $10M"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="ingest-valuation-claim" className="block text-xs font-semibold text-zinc-700 mb-1">
                    Valuation Claim ($)
                  </label>
                  <input
                    id="ingest-valuation-claim"
                    type="text"
                    value={valuationClaim}
                    onChange={(e) => setValuationClaim(e.target.value)}
                    placeholder="e.g. $45M Pre-Money"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label htmlFor="ingest-arr" className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    ARR ($M)
                  </label>
                  <input
                    id="ingest-arr"
                    type="number"
                    step="0.1"
                    value={arr}
                    onChange={(e) => setArr(e.target.value)}
                    placeholder="e.g. 2.4"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="ingest-burn" className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Net Burn ($k/mo)
                  </label>
                  <input
                    id="ingest-burn"
                    type="number"
                    value={burn}
                    onChange={(e) => setBurn(e.target.value)}
                    placeholder="e.g. 180"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="ingest-runway" className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Runway (Mo)
                  </label>
                  <input
                    id="ingest-runway"
                    type="number"
                    value={runway}
                    onChange={(e) => setRunway(e.target.value)}
                    placeholder="e.g. 11"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 font-mono tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: File Upload & Pitch Narrative */}
          <div className="lg:col-span-7 space-y-5">
            {/* File Upload Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50/60 scale-[1.01]'
                  : 'border-zinc-300 hover:border-zinc-400 bg-white hover:bg-zinc-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.csv,.pdf,.doc,.docx"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="text-sm font-bold text-zinc-900">
                Click to browse or drop pitch deck file here
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Supports PDF, TXT, Markdown, JSON, CSV, DOCX (pitch deck export, financial model summary, or IC memo)
              </p>

              {uploadedFileName && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Loaded file: {uploadedFileName}</span>
                </div>
              )}
            </div>

            {uploadStatusMessage && (
              <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-700 flex items-center justify-between">
                <span>{uploadStatusMessage}</span>
                <button
                  type="button"
                  onClick={() => setUploadStatusMessage(null)}
                  className="text-zinc-400 hover:text-zinc-600 cursor-pointer ml-2"
                >
                  ×
                </button>
              </div>
            )}

            {/* Pitch Transcript / Deal Notes Text Area */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <label htmlFor="ingest-pitch-textarea" className="text-sm font-bold text-zinc-900 cursor-pointer">
                    Pitch Transcript / Financial Data / Raw Notes
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {wordCount.toLocaleString()} words
                  </span>
                  {pitchText.trim() && (
                    <button
                      type="button"
                      onClick={() => setPitchText('')}
                      aria-label="Clear pitch transcript"
                      className="text-xs text-zinc-400 hover:text-rose-600 transition-colors p-1"
                      title="Clear text"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <textarea
                id="ingest-pitch-textarea"
                rows={13}
                value={pitchText}
                onChange={(e) => setPitchText(e.target.value)}
                placeholder="Paste the founder's pitch deck transcript, executive summary, reported cohort retention tables, customer lists, cap table notes, or financial metrics here..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:bg-white leading-relaxed font-sans transition-all resize-y"
                required
              />

              <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500">
                <span>
                  The auditor automatically parses ARR, burn rate, runway, CAC payback, retention, and gross margins.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Auditing will generate all 9 VC Diligence Pillars and redirect directly into the active Deal Room.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-all cursor-pointer"
            >
              Reset Form
            </button>

            <button
              type="submit"
              disabled={isLoading || !pitchText.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Auditing Startup Diligence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Run Institutional VC Diligence Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audit Pipeline Indicators */}
        {isLoading && (
          <div className="bg-white border border-emerald-500/40 rounded-2xl p-6 shadow-md animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Synthesizing Institutional Investment Memo & Diligence Audit
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Auditing across a16z 16 metrics, Sequoia crucible, Bessemer cloud standards, and Benchmark reality...
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pillars 01-03: Verdict, Scorecard & Trajectory</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">Normalizing stated ARR and measuring variance against top-quartile standards.</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pillars 04-06: Metrics, Stress Testing & Velocity</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-1">Validating subsector hurdles and scanning for concealed CAC or cohort decay.</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Pillars 07-09: Sector Hurdles, Forensics & Questions</span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">Drafting adversarial partner questions and calibrating forensic data gap audit.</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
