import React, { useState } from 'react';
import {
  ShieldAlert,
  Target,
  TrendingUp,
  BarChart3,
  Sliders,
  Flame,
  Layers,
  EyeOff,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Compass,
  FileSpreadsheet,
  Cpu,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface DiligenceFrameworkExplainerProps {
  onNavigateToPillarTab?: (pillarId: number) => void;
  isLoggedIn?: boolean;
  onOpenAuthModal?: (prompt?: string) => void;
}

interface PillarDetail {
  id: number;
  label: string;
  subtitle: string;
  category: 'synthesis' | 'financials' | 'velocity' | 'forensics';
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  frameworkOrigin: string;
  coreObjective: string;
  whatIsAudited: string[];
  redFlagsDetected: string[];
  deliverables: string;
}

const PILLARS_DATA: PillarDetail[] = [
  {
    id: 1,
    label: 'Investment Verdict',
    subtitle: 'Traffic Light Directive & MOIC Payoff Waterfall',
    category: 'synthesis',
    categoryLabel: 'Conviction & Synthesis',
    icon: ShieldAlert,
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    frameworkOrigin: 'Sequoia Capital IC & Benchmark Capital Conviction Standard',
    coreObjective:
      'Synthesizes the entire 9-vector audit into an executive traffic light signal (High Conviction, Conditional, or Pass/Reject) and a quantitative Conviction Score (0–100) based on return distribution.',
    whatIsAudited: [
      'Asymmetric return profile: Modeling Bull Case (10x+ MOIC), Base Case (3-5x), and Bear Case downside capital loss.',
      'Lead Partner Directive: Clear programmatic stance for the Investment Committee on term sheet issuance.',
      'Executive risk-weighted return margin vs alternative venture deployment opportunities.',
    ],
    redFlagsDetected: [
      'Unsubstantiated 100x return claims unsupported by serviceable addressable market capacity.',
      'Symmetric or negative risk-reward skew where downside loss probability exceeds upside multiplier.',
      'Lack of clear structural path to a $1B+ enterprise market valuation.',
    ],
    deliverables: 'Traffic Light Badge, Conviction Score (0-100), 3-Scenario Payoff Waterfall, Lead Partner Directive.',
  },
  {
    id: 2,
    label: '5-Factor Diligence Scorecard',
    subtitle: 'Multi-Vector Radar & Institutional Hurdle Audit',
    category: 'synthesis',
    categoryLabel: 'Conviction & Synthesis',
    icon: Target,
    accentColor: 'blue',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    frameworkOrigin: 'Bessemer Venture Partners & Founders Fund Thesis Testing',
    coreObjective:
      'Normalizes subjective pitch narratives into 5 quantitative hurdle scores (scored 1 to 10) plotted against top-quartile venture radar thresholds.',
    whatIsAudited: [
      'Founder Pedigree & Technical Velocity: Prior exits, domain insight, engineering execution tempo.',
      'Addressable TAM & Market Expansion: Verified bottom-up market sizing vs inflated top-down statistics.',
      'Product Defensibility & Structural Moat: Network effects, proprietary data assets, and switching costs.',
      'Unit Economics & Gross Margin Profile: Contribution margins, CAC efficiency, and long-term operating leverage.',
      'Execution & Regulatory Diligence Risk: Dependencies, go-to-market friction, and key-person vulnerability.',
    ],
    redFlagsDetected: [
      'TAM conflation (claiming broad industry gross spend rather than realistic software capture).',
      'Feature-level product easily replicated by incumbents within 2 engineering quarters.',
      'Founder-market disconnect without technical or customer domain advantage.',
    ],
    deliverables: '5-Axis Spider Radar, Normalized 10-Point Vector Scores, Qualitative Risk Rationale.',
  },
  {
    id: 3,
    label: 'Financial Trajectory',
    subtitle: 'Operating Vitals & Historical Quarter-by-Quarter Run-Rate',
    category: 'financials',
    categoryLabel: 'Financial & Unit Economics',
    icon: TrendingUp,
    accentColor: 'teal',
    badgeBg: 'bg-teal-50',
    badgeBorder: 'border-teal-200',
    badgeText: 'text-teal-700',
    frameworkOrigin: 'SaaS Capital Operating Benchmarks & Institutional LP Reporting Standards',
    coreObjective:
      'Audits historical quarterly performance across contracted ARR, GAAP recognized revenue, gross margins, cash net burn, and net revenue retention (NDR) run rates.',
    whatIsAudited: [
      'Contract ARR vs GAAP revenue reconciliation: Validating true recurring billing cadence.',
      'Quarterly trajectory and growth deceleration rates across 4+ audited quarters.',
      'True cost of goods sold (COGS) including cloud infrastructure, API hosting, and support expenses.',
      'Runway exhaustion velocity based on trailing 3-month average net cash burn.',
    ],
    redFlagsDetected: [
      'Phantom ARR: Unsigned LOIs or multi-year contracts improperly booked as live annual recurring revenue.',
      'Hidden hosting/inference costs reallocated to R&D to artificially inflate reported gross margins.',
      'Steep quarter-over-quarter growth deceleration obscured behind cumulative figures.',
    ],
    deliverables: 'Quarterly Financial Table, Ending ARR, Monthly Burn, Cash Runway, and Margin Trajectory.',
  },
  {
    id: 4,
    label: 'Financial & Growth Metrics',
    subtitle: 'Quantitative Benchmarks Scorecard vs a16z & Bessemer',
    category: 'financials',
    categoryLabel: 'Financial & Unit Economics',
    icon: BarChart3,
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-700',
    frameworkOrigin: 'Andreessen Horowitz (a16z) SaaS Metrics & Bessemer State of the Cloud',
    coreObjective:
      'Benchmarks core operational metrics against verified top-quartile and median cutoffs from institutional venture indexes.',
    whatIsAudited: [
      'Magic Number (Sales Efficiency): Net new ARR divided by prior-quarter S&M expenditure (Target: >1.0x).',
      'Rule of 40: Annual revenue growth rate percentage plus free cash flow margin percentage (Target: >40%).',
      'LTV : CAC Ratio & Payback Period: Lifetime customer value relative to fully loaded acquisition cost (Target: >3.5x).',
      'Net Burn Multiple: Net cash burned divided by net ARR added in the period (Target: <1.2x top-tier).',
      'ARR per Full-Time Employee (FTE): Operational leverage and human capital productivity.',
    ],
    redFlagsDetected: [
      'Excessive Burn Multiple (>2.5x) indicating high cash consumption for marginal revenue growth.',
      'CAC payback period exceeding 24 months in enterprise software or >12 months in SMB.',
      'Disguised sales efficiency where expansion ARR is credited without fully amortized sales commissions.',
    ],
    deliverables: 'Benchmark Distribution Scorecard, Quartile Status Badges (Top Quartile / Median / At Risk).',
  },
  {
    id: 5,
    label: 'Runway & Stress Test',
    subtitle: 'Valuation Sensitivity & Downside Burn Simulator',
    category: 'financials',
    categoryLabel: 'Financial & Unit Economics',
    icon: Sliders,
    accentColor: 'purple',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-700',
    frameworkOrigin: 'Morgan Stanley Public SaaS Multiples & First Round Capital Downside Protocols',
    coreObjective:
      'Stress-tests startup survivability and valuation multiples under adverse conditions, lengthened enterprise sales cycles, and sudden revenue halts.',
    whatIsAudited: [
      'Zero-Growth Runway Horizon: Exact months of survival if all new pipeline expansion drops to zero.',
      'Valuation multiple sensitivity: Current implied ARR multiple vs historical exit multiples (6x to 25x ARR).',
      'Sales cycle elasticity: Impact of 30-to-90 day enterprise sales procurement delays on cash burn.',
      'Capital efficiency under 20% to 50% gross margin contraction scenarios.',
    ],
    redFlagsDetected: [
      'Insolvency wall within 6 to 9 months requiring predatory bridge financing or heavy down-round dilution.',
      'Unrealistic valuation pricing expectations disconnected from public market trading comps.',
      'Inability to achieve default-alive status without continuous dilutive equity injections.',
    ],
    deliverables: 'Interactive Sensitivity Model, Valuation Multiple Analyzer, Downside Stress Matrix.',
  },
  {
    id: 6,
    label: 'Growth Velocity & Cohort',
    subtitle: 'Month-over-Month Velocity & Cohort Retention Decay',
    category: 'velocity',
    categoryLabel: 'Velocity & Growth Quality',
    icon: Flame,
    accentColor: 'amber',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-700',
    frameworkOrigin: 'OpenView Product-Led Growth & Tomasz Tunguz SaaS Cohort Matrix',
    coreObjective:
      'Performs cohort retention slicing and month-over-month ARR expansion tracking to detect leaky-bucket customer churn disguised by aggregate growth.',
    whatIsAudited: [
      'Historical monthly cohort retention decay: Real dollar retention after 3, 6, 9, and 12 months.',
      'Gross Revenue Retention (GRR) vs Net Revenue Retention (NDR): Isolating core churn from upsell masking.',
      'Expansion velocity: Net expansion speed across historical customer cohorts.',
      'Contract renewal concentration and impending high-value renewal cliffs.',
    ],
    redFlagsDetected: [
      'Leaky bucket churn: Aggressive new logo additions hiding severe year-1 customer attrition.',
      'Divergence between reported blended NDR and underlying cohort retention degradation.',
      'High revenue concentration in non-renewing pilot or POC contracts.',
    ],
    deliverables: 'MoM ARR Velocity Heatmap, Cohort Retention Curves, True Underlying vs Reported Retention.',
  },
  {
    id: 7,
    label: 'Sector-Specific Concerns',
    subtitle: 'Tailored Industry Operational & Compliance Deep-Dives',
    category: 'velocity',
    categoryLabel: 'Velocity & Growth Quality',
    icon: Layers,
    accentColor: 'cyan',
    badgeBg: 'bg-cyan-50',
    badgeBorder: 'border-cyan-200',
    badgeText: 'text-cyan-700',
    frameworkOrigin: 'Specialized Practice Rubrics (a16z Bio+Health, Lightspeed Enterprise, Ribbit FinTech)',
    coreObjective:
      'Applies specialized diligence checks calibrated specifically to the startup’s domain (Enterprise AI, FinTech, HealthTech, Cyber/Defense).',
    whatIsAudited: [
      'Enterprise AI: Model margin ceilings, GPU cluster token economics, data rights, and OpenAI/Anthropic lock-in.',
      'FinTech: Regulatory banking sponsor dependencies, balance sheet risk, fraud loss rates, and compliance.',
      'HealthTech: HIPAA compliance, FDA 510(k) pathway requirements, physician workflow adoption friction.',
      'Cyber/Defense: FedRAMP certification milestones, DOD procurement timelines, and security clearance barriers.',
    ],
    redFlagsDetected: [
      'Foundation model wrapper with 35-45% gross margins and zero proprietary intelligence moat.',
      'Existential regulatory dependency on a single banking sponsor or platform API provider.',
      'High pilot attrition caused by clinical integration or complex IT security gatekeeping.',
    ],
    deliverables: 'Vertical Compliance Scorecard, Sector Benchmark Audit, Industry Risk Classification.',
  },
  {
    id: 8,
    label: 'Hidden Risks & Omissions',
    subtitle: 'Forensic Data Gap Audit & Concealed Liability Detection',
    category: 'forensics',
    categoryLabel: 'Forensic Risks & Meeting Strategy',
    icon: EyeOff,
    accentColor: 'rose',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-700',
    frameworkOrigin: 'Private Equity Forensic Audit & Investigative Venture Diligence Protocols',
    coreObjective:
      'Detects omitted disclosures, buried cap table liabilities, and strategic concealments that standard pitch decks omit.',
    whatIsAudited: [
      'Customer Concentration: Identifying if the top 2-3 customers account for >30-50% of total company revenue.',
      'Cap table irregularities: Unvested founder shares, liquidation preferences, and pending bridge note warrants.',
      'Capitalized R&D maneuvers: Engineering payroll improperly classified on balance sheets to obscure net burn.',
      'Contract cancellation clauses, unannounced litigation, or IP ownership ambiguities.',
    ],
    redFlagsDetected: [
      'A single customer representing 40%+ of ARR with renewal leverage over future company survival.',
      'Buried founder equity dispute or co-founder departure severance liabilities.',
      'Concealed SLA breach penalties or deferred customer rebate commitments.',
    ],
    deliverables: 'Forensic Gap Flags (Critical / High), Surface Claim vs Concealed Reality Matrix, Valuation Impact.',
  },
  {
    id: 9,
    label: 'Questions to Ask',
    subtitle: 'Partner Diligence Interrogatories & Warning Triggers',
    category: 'forensics',
    categoryLabel: 'Forensic Risks & Meeting Strategy',
    icon: HelpCircle,
    accentColor: 'orange',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-200',
    badgeText: 'text-orange-700',
    frameworkOrigin: 'Benchmark Capital Partner Meeting Playbook & Sequoia Founder Interview Guidelines',
    coreObjective:
      'Arms partners with an institutional battery of precision interrogatories organized by strategic clusters, equipped with hidden intent and red flag triggers.',
    whatIsAudited: [
      'Unit economics verification: Testing founder command of gross margins, churn, and acquisition costs.',
      'Defensibility and moat stress: Probing technical differentiation under incumbent replication pressure.',
      'Go-to-market mechanics: Questioning pipeline qualification criteria, win rates, and CAC payback reality.',
      'Governance & team execution: Probing key executive retention and technical talent acquisition capacity.',
    ],
    redFlagsDetected: [
      'Evasive, hand-waving responses when pressed on customer churn or unit economics components.',
      'Inability to articulate an unambiguous customer acquisition channel with sub-12 month payback.',
      'Founder defensiveness or refusal to acknowledge technical dependency on third-party vendors.',
    ],
    deliverables: 'Categorized Partner Question Bank, Strategic Intent Guide, and Founder Red Flag Indicators.',
  },
];

type CategoryFilter = 'all' | 'synthesis' | 'financials' | 'velocity' | 'forensics';

export const DiligenceFrameworkExplainer: React.FC<DiligenceFrameworkExplainerProps> = ({
  onNavigateToPillarTab,
  isLoggedIn = false,
  onOpenAuthModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [expandedPillarId, setExpandedPillarId] = useState<number | null>(1);

  const filteredPillars =
    selectedCategory === 'all'
      ? PILLARS_DATA
      : PILLARS_DATA.filter((p) => p.category === selectedCategory);

  const handlePillarClick = (pillarId: number) => {
    if (expandedPillarId === pillarId) {
      setExpandedPillarId(null);
    } else {
      setExpandedPillarId(pillarId);
    }
  };

  const handleLaunchPillarDealRoom = (e: React.MouseEvent, pillarId: number) => {
    e.stopPropagation();
    if (!isLoggedIn && onOpenAuthModal) {
      onOpenAuthModal(`Sign in with your Google or investor account to examine Pillar 0${pillarId} in the live Deal Room.`);
      return;
    }
    if (onNavigateToPillarTab) {
      onNavigateToPillarTab(pillarId);
    }
  };

  return (
    <section
      aria-label="Institutional 9-Pillar Diligence Framework"
      className="w-full mt-4 mb-16 max-w-7xl mx-auto px-1 sm:px-2"
    >
      {/* Component Header Card */}
      <div className="bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden mb-8">
        {/* Subtle decorative top border glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 opacity-90" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="max-w-3xl">
            {/* Framework Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-3 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Institutional Audit Methodology · 9-Pillar Framework</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight font-serif leading-tight">
              The 9 Diligence Pillars of Institutional Venture Audit
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 mt-2.5 leading-relaxed">
              Venture investments fail not from lack of optimism, but from unexamined assumptions. Pitch Black
              subjects every startup pitch to 9 rigorous audit vectors modeled on the underwriting standards of{' '}
              <strong className="text-zinc-900">a16z, Sequoia, Bessemer, and Benchmark</strong>.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 bg-white border border-zinc-200 rounded-2xl p-2.5 shadow-2xs">
            <div className="px-3 py-2 text-center rounded-xl bg-zinc-50">
              <span className="block text-base sm:text-lg font-bold font-mono text-zinc-900">9</span>
              <span className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Vectors</span>
            </div>
            <div className="px-3 py-2 text-center rounded-xl bg-zinc-50">
              <span className="block text-base sm:text-lg font-bold font-mono text-emerald-600">40+</span>
              <span className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Benchmarks</span>
            </div>
            <div className="px-3 py-2 text-center rounded-xl bg-zinc-50">
              <span className="block text-base sm:text-lg font-bold font-mono text-blue-600">100%</span>
              <span className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Forensic</span>
            </div>
            <div className="px-3 py-2 text-center rounded-xl bg-zinc-50">
              <span className="block text-base sm:text-lg font-bold font-mono text-purple-600">IC Ready</span>
              <span className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Memos</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-zinc-200/80">
          <span className="text-xs font-semibold text-zinc-500 mr-2 shrink-0 hidden sm:inline">
            Filter Pillars:
          </span>
          {[
            { id: 'all', label: 'All 9 Pillars' },
            { id: 'synthesis', label: 'Conviction & Synthesis' },
            { id: 'financials', label: 'Financials & Unit Economics' },
            { id: 'velocity', label: 'Velocity & Sector Risks' },
            { id: 'forensics', label: 'Forensics & Questions' },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-zinc-900 text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 9 Pillars Interactive Cards Container */}
      <div className="space-y-4">
        {filteredPillars.map((pillar) => {
          const Icon = pillar.icon;
          const isExpanded = expandedPillarId === pillar.id;

          return (
            <div
              key={pillar.id}
              onClick={() => handlePillarClick(pillar.id)}
              className={`bg-white border rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${
                isExpanded
                  ? 'border-emerald-500/60 shadow-md ring-1 ring-emerald-500/10'
                  : 'border-zinc-200/90 hover:border-zinc-300 hover:shadow-xs'
              }`}
            >
              {/* Card Banner / Collapsed Summary */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* Pillar Number Badge */}
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-mono text-sm font-bold shrink-0 shadow-2xs">
                    0{pillar.id}
                  </div>

                  {/* Icon */}
                  <div className={`p-2 rounded-xl border ${pillar.badgeBg} ${pillar.badgeBorder} shrink-0`}>
                    <Icon className={`w-5 h-5 ${pillar.badgeText}`} />
                  </div>

                  {/* Title & Tagline */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                        Pillar 0{pillar.id}: {pillar.label}
                      </h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${pillar.badgeBg} ${pillar.badgeBorder} ${pillar.badgeText}`}>
                        {pillar.categoryLabel}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-500 truncate max-w-2xl mt-0.5">
                      {pillar.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    onClick={(e) => handleLaunchPillarDealRoom(e, pillar.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-700 text-xs font-semibold border border-zinc-200 hover:border-emerald-300 transition-all cursor-pointer group"
                    title={`Open Pillar 0${pillar.id} in Deal Room`}
                  >
                    <span>Audit in Deal Room</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors">
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-emerald-600' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Detailed Breakdown */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-zinc-100 bg-zinc-50/50 text-left animate-in fade-in duration-150">
                  {/* Institutional Reference Origin */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4 bg-white border border-zinc-200/80 rounded-xl px-3.5 py-2 shadow-2xs">
                    <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong className="text-zinc-800">Underwriting Benchmark:</strong>{' '}
                      {pillar.frameworkOrigin}
                    </span>
                  </div>

                  {/* Core Objective */}
                  <div className="mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Audit Purpose & Core Objective</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-white p-3.5 rounded-xl border border-zinc-200/70">
                      {pillar.coreObjective}
                    </p>
                  </div>

                  {/* Two-Column Grid: What Is Audited vs Red Flags Caught */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* What Is Audited */}
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 mb-2.5 pb-1.5 border-b border-zinc-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Key Deliverables & Factors Audited</span>
                      </div>
                      <ul className="space-y-2">
                        {pillar.whatIsAudited.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Critical Red Flags Detected */}
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 mb-2.5 pb-1.5 border-b border-zinc-100">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Critical Failure Modes & Red Flags Caught</span>
                      </div>
                      <ul className="space-y-2">
                        {pillar.redFlagsDetected.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Deliverables Strip & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-200/60 text-xs text-zinc-500">
                    <div>
                      <strong className="text-zinc-700">Audit Artifacts:</strong>{' '}
                      <span className="font-mono text-zinc-600">{pillar.deliverables}</span>
                    </div>

                    <button
                      onClick={(e) => handleLaunchPillarDealRoom(e, pillar.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
                    >
                      <span>Explore Pillar 0{pillar.id} in Active Deal Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Institutional Synthesis Bottom Callout */}
      <div className="mt-8 bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-zinc-900">
              Complete Institutional Coverage in Every Deal Room
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl leading-relaxed">
              Every analyzed startup—whether selected from curated seed/Series A presets or custom ingested pitches—has
              all 9 pillars audited simultaneously. You can export complete IC memos or consult the PitchAI Senior Diligence Copilot at any stage.
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            if (!isLoggedIn && onOpenAuthModal) {
              onOpenAuthModal('Sign in to launch the institutional Deal Room and inspect all 9 diligence pillars.');
              return;
            }
            if (onNavigateToPillarTab) onNavigateToPillarTab(1);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Launch Deal Room (All 9 Pillars)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
