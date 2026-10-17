import React, { useState } from 'react';
import {
  BarChart3,
  ShieldAlert,
  Layers,
  Compass,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Scale,
  Zap,
  HelpCircle,
  FileText,
  Filter,
  Flame,
  Cpu,
  CreditCard,
  Stethoscope,
  Radio,
  Lock,
} from 'lucide-react';

export type BenchmarkFramework = 'all' | 'a16z' | 'sequoia' | 'bessemer' | 'benchmark';

interface BenchmarksPageProps {
  initialFramework?: BenchmarkFramework;
  onSelectDeal: (dealId: string) => void;
  isLoggedIn?: boolean;
  onOpenAuth?: (prompt?: string) => void;
}

export const BURN_MULTIPLE_TIERS = [
  {
    tier: 'ULTRA_EFFICIENT',
    label: 'Ultra-Efficient',
    rangeLabel: '< 1.0x',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    description: 'Generates >$1.00 of Net New ARR per $1.00 cash burned. Top 5% outlier venture efficiency.',
    vcImplication: 'Exceptional capital stewardship. Justifies premium valuation multiple and aggressive growth capital.',
  },
  {
    tier: 'EFFICIENT',
    label: 'Efficient / Good',
    rangeLabel: '1.0x – 1.5x',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    description: 'Healthy venture benchmark. Sound unit economics with controlled acquisition costs.',
    vcImplication: 'Standard institutional target for Series A/B software. Greenlight to expand sales capacity.',
  },
  {
    tier: 'AVERAGE',
    label: 'Average / Developing',
    rangeLabel: '1.5x – 2.0x',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    description: 'High capital drag. Burning $1.50 – $2.00 per dollar of Net New ARR added.',
    vcImplication: 'Audit GTM efficiency and gross margin drag. Recommend tightening sales cycle prior to Series B.',
  },
  {
    tier: 'HIGH_BURN',
    label: 'High Burn / Dilutive',
    rangeLabel: '> 2.0x',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    description: 'Inefficient capital consumption (> $2.00 cash burned per $1 ARR). Severe dilution drag.',
    vcImplication: 'Red-flag in IC diligence. Require headcount freeze or cloud/COGS renegotiation to extend runway.',
  },
];

export interface MetricItem {
  id: string;
  framework: 'a16z' | 'bessemer' | 'sequoia' | 'benchmark';
  name: string;
  category: string;
  formula: string;
  topQuartile: string;
  median: string;
  redFlag: string;
  diligenceContext: string;
  auditQuestion: string;
}

export const BENCHMARK_METRICS: MetricItem[] = [
  {
    id: 'arr-vs-gmv',
    framework: 'a16z',
    name: '1. Contracted ARR vs. GMV',
    category: 'Revenue Quality',
    formula: 'Recognized Subscription Contract Value (Excluding Passthrough Gross Merchandise Volume)',
    topQuartile: '>90% pure recurring software ARR',
    median: '70%–85% pure software ARR',
    redFlag: '<50% software ARR (marketplace or low-margin payment GMV disguised as software)',
    diligenceContext: 'a16z mandates stripping out GMV, one-time integration fees, and pass-through flow. Gross take-rate must translate into predictable software revenue.',
    auditQuestion: 'What percentage of stated ARR is contractual, auto-renewing subscription revenue versus usage-based flow or setup fees?'
  },
  {
    id: 'arr-growth',
    framework: 'a16z',
    name: '2. ARR Growth Velocity (YoY)',
    category: 'Revenue Quality',
    formula: '(Ending ARR - Beginning ARR) / Beginning ARR * 100%',
    topQuartile: '>150% YoY (Seed/Series A), >100% (Series B)',
    median: '80%–120% YoY',
    redFlag: '<50% YoY at early stage',
    diligenceContext: 'Venture returns follow a power law where companies in the top 5th percentile triple and double revenue ("T2D3"). Below 60% early-stage growth signals stalling demand.',
    auditQuestion: 'Is growth driven by organic customer pull or unsustainable, heavily discounted pilot conversions?'
  },
  {
    id: 'nrr',
    framework: 'a16z',
    name: '3. Net Revenue Retention (NRR)',
    category: 'Revenue Quality',
    formula: '(Beginning ARR + Expansion - Contraction - Churn) / Beginning ARR * 100%',
    topQuartile: '>130% for Enterprise, >115% for Mid-Market',
    median: '110%–120%',
    redFlag: '<100% (leaky bucket where existing cohort shrinks over time)',
    diligenceContext: 'The holy grail of SaaS. A company with 130% NRR grows 30% annually without adding a single new customer.',
    auditQuestion: 'Break down NRR between seat expansion, tier up-selling, and cross-sell of new modules.'
  },
  {
    id: 'gross-margin',
    framework: 'a16z',
    name: '4. Gross Margin (Post-Cloud & Inference COGS)',
    category: 'Revenue Quality',
    formula: '(Revenue - Total Cost of Goods Sold) / Revenue * 100%',
    topQuartile: '>80% (Pure SaaS), >70% (Enterprise AI with heavy LLM inference)',
    median: '70%–75%',
    redFlag: '<60% (AI API passthrough or heavy human-in-the-loop services)',
    diligenceContext: 'In the generative AI era, raw GPU hosting and OpenAI/Anthropic API calls erode gross margin from 80% to 50% if unit economics are ignored.',
    auditQuestion: 'Are hosting compute, inference tokens, and Tier-1 customer onboarding included in reported COGS?'
  },
  {
    id: 'blended-vs-paid-cac',
    framework: 'a16z',
    name: '5. Blended vs. Paid CAC Disparity',
    category: 'Unit Economics',
    formula: 'Total S&M Spend / Direct Paid Acquisitions vs. All Acquisitions',
    topQuartile: 'Paid CAC within 1.5x of Blended CAC',
    median: 'Paid CAC is 2.0x–2.5x of Blended CAC',
    redFlag: 'Paid CAC is >4x Blended CAC (founders hiding paid channel unprofitability behind word-of-mouth)',
    diligenceContext: 'Founders frequently cite blended CAC to conceal skyrocketing Google/Meta/LinkedIn acquisition costs. In diligence, only paid channel CAC determines scale limits.',
    auditQuestion: 'What is your fully-loaded CAC strictly through paid marketing and outbound sales channels?'
  },
  {
    id: 'cac-payback',
    framework: 'bessemer',
    name: '6. CAC Payback Period',
    category: 'Unit Economics',
    formula: '(Prior Quarter S&M Spend) / (Net New ARR * Gross Margin) * 12 Months',
    topQuartile: '<9 Months (Enterprise), <6 Months (SMB)',
    median: '12–15 Months',
    redFlag: '>24 Months (cash is trapped in customer acquisition too long)',
    diligenceContext: 'Bessemer Cloud Index standard: Short payback cycles enable fast capital recycling without excessive equity dilution.',
    auditQuestion: 'On a gross-margin adjusted basis, in which month does an acquired enterprise cohort breakeven on acquisition spend?'
  },
  {
    id: 'ltv-cac',
    framework: 'a16z',
    name: '7. LTV to CAC Ratio',
    category: 'Unit Economics',
    formula: '(Average Revenue Per Account * Gross Margin * Lifespan) / CAC',
    topQuartile: '>4.0x–5.0x',
    median: '3.0x–3.5x',
    redFlag: '<2.0x (unviable business model; marketing burns more cash than customers return)',
    diligenceContext: 'High LTV/CAC indicates either strong pricing power or high customer lock-in. Below 3x leaves no margin for team expansion or R&D.',
    auditQuestion: 'How many years of historical cohort data support your assumed customer lifetime?'
  },
  {
    id: 'burn-multiple',
    framework: 'bessemer',
    name: '8. Bessemer Burn Multiple',
    category: 'Capital Efficiency',
    formula: 'Net Burn / Net New ARR in Given Period',
    topQuartile: '<0.8x (Incredible Capital Efficiency)',
    median: '1.0x–1.5x (Good)',
    redFlag: '>2.0x (Burning $2 to generate $1 of new ARR indicates serious friction)',
    diligenceContext: 'Created by David Sacks and standardized by Bessemer. Burn Multiple strips away financial engineering and directly measures capital consumed per dollar of ARR gained.',
    auditQuestion: 'For every $1.00 of net cash burned over the last 12 months, how many dollars of net new ARR did your team produce?'
  },
  {
    id: 'rule-of-40',
    framework: 'bessemer',
    name: '9. Rule of 40',
    category: 'Capital Efficiency',
    formula: 'YoY Revenue Growth Rate (%) + Free Cash Flow Margin (%)',
    topQuartile: '>50%–60%',
    median: '35%–45%',
    redFlag: '<20% (mediocre growth paired with heavy cash burn)',
    diligenceContext: 'Bessemer and a16z core valuation benchmark for SaaS. Allows high burn only if growth is hyper-accelerated (>100%).',
    auditQuestion: 'What is your combined Growth Rate + FCF margin over the last trailing twelve months?'
  },
  {
    id: 'magic-number',
    framework: 'bessemer',
    name: '10. BVP Magic Number',
    category: 'Capital Efficiency',
    formula: '(Quarterly Net New ARR * 4) / Prior Quarter Sales & Marketing Expense',
    topQuartile: '>1.0x (Pour fuel on sales engine)',
    median: '0.75x–1.0x (Healthy efficiency)',
    redFlag: '<0.5x (Pause sales hiring; product-market fit or go-to-market execution broken)',
    diligenceContext: 'Dictates whether the firm should recommend scaling the enterprise sales team or fixing product churn.',
    auditQuestion: 'How has the Magic Number evolved over the last 4 quarters as you hired more quota-carrying reps?'
  },
  {
    id: 'logo-vs-dollar-churn',
    framework: 'a16z',
    name: '11. Logo Churn vs. Dollar Churn',
    category: 'Customer Health',
    formula: 'Lost Customer Count / Total Customers vs. Lost ARR / Total ARR',
    topQuartile: '<0.5% monthly logo churn, negative net dollar churn',
    median: '1.0%–1.5% monthly logo churn',
    redFlag: '>2.5% monthly logo churn (30%+ annual turnover)',
    diligenceContext: 'a16z warns that large customer account expansions often mask high logo turnover among smaller customers, signaling fragile PMF.',
    auditQuestion: 'What is the quarterly logo churn rate when broken down by customer revenue tier?'
  },
  {
    id: 'cohort-smile',
    framework: 'a16z',
    name: '12. Cohort Retention "Smile" Curve',
    category: 'Customer Health',
    formula: 'Cumulative cohort spend tracked monthly from Month 0 through Month 36',
    topQuartile: 'Cohort curve flattens by Month 6 and curls upward ("smile" curve)',
    median: 'Cohort curve flattens by Month 12 at 70% retention',
    redFlag: 'Cohort curve continues downward linear decay toward zero',
    diligenceContext: 'If older cohorts never stabilize, the business is fundamentally uninvestable regardless of top-line growth rate.',
    auditQuestion: 'Can you provide the complete un-truncated cohort matrix from inception to verify stabilization?'
  },
  {
    id: 'customer-concentration',
    framework: 'benchmark',
    name: '13. Benchmark Concentration Threshold',
    category: 'Customer Health',
    formula: 'ARR of Top 1 Customer & Top 3 Customers / Total ARR',
    topQuartile: 'Top customer <5% of ARR, Top 3 <15% of ARR',
    median: 'Top customer 10%, Top 3 25%',
    redFlag: 'Single customer >20% or Top 3 >40% of company revenue',
    diligenceContext: 'Benchmark framework: High concentration creates existential fragility. Loss of one buyer triggers down-rounds or insolvency.',
    auditQuestion: 'If your single largest enterprise account terminated tomorrow, what would happen to cash runway?'
  },
  {
    id: 'organic-pull',
    framework: 'benchmark',
    name: '14. Benchmark Organic Pull Ratio',
    category: 'Market Reality',
    formula: 'Inbound Inquiries & Word-of-Mouth Signups / Total Pipeline Opportunities',
    topQuartile: '>60% inbound pipeline with high conversion',
    median: '35%–50% inbound',
    redFlag: '<20% inbound (reliant purely on cold outbound emails and aggressive price cuts)',
    diligenceContext: 'Benchmark partners seek markets with desperate demand where the product is pulled from the company, not pushed by sales reps.',
    auditQuestion: 'What percentage of closed-won deals originated from customer referral, open-source adoption, or unprompted inbound?'
  },
  {
    id: 'esop-reserve',
    framework: 'sequoia',
    name: '15. Unallocated ESOP Pool Headroom',
    category: 'Governance & Moat',
    formula: 'Available Unissued Options / Fully Diluted Share Count',
    topQuartile: '>12%–15% post-financing unallocated pool',
    median: '8%–10% unallocated pool',
    redFlag: '<5% unallocated (guarantees immediate dilution before hiring critical executive hires)',
    diligenceContext: 'Sequoia Crucible audit: Under-reserved ESOP pools are a classic trap. Investors get diluted on key VP hires within 6 months.',
    auditQuestion: 'Is the option pool size calculated pre-money or post-money, and how many shares remain ungranted?'
  },
  {
    id: 'crucible-defensibility',
    framework: 'sequoia',
    name: '16. Sequoia Crucible Moat Defensibility',
    category: 'Governance & Moat',
    formula: 'Qualitative barrier score: Proprietary Data + Workflow Stickiness + Network Effects',
    topQuartile: 'High switching costs, embedded core database, proprietary feedback loop',
    median: 'Moderate workflow integration, 6-month replacement timeline',
    redFlag: 'Zero proprietary IP, vulnerable to OpenAI / Microsoft native feature update',
    diligenceContext: 'The Crucible test evaluates whether the company will exist in 5 years when platform incumbents release equivalent features.',
    auditQuestion: 'What proprietary asset or data feedback loop prevents a big tech incumbent from copying this in 6 months?'
  }
];

export const BenchmarksPage: React.FC<BenchmarksPageProps> = ({
  initialFramework = 'all',
  isLoggedIn = false,
  onOpenAuth,
}) => {
  const [activeFramework, setActiveFramework] = useState<BenchmarkFramework>(initialFramework);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredMetrics = BENCHMARK_METRICS.filter((metric) => {
    if (!metric) return false;
    const matchesFramework = activeFramework === 'all' || metric.framework === activeFramework;
    const matchesCategory = selectedCategory === 'all' || metric.category === selectedCategory;
    const sQuery = searchQuery.toLowerCase().trim();
    const matchesSearch =
      sQuery === '' ||
      String(metric.name || '').toLowerCase().includes(sQuery) ||
      String(metric.formula || '').toLowerCase().includes(sQuery) ||
      String(metric.diligenceContext || '').toLowerCase().includes(sQuery) ||
      String(metric.category || '').toLowerCase().includes(sQuery);

    return matchesFramework && matchesCategory && matchesSearch;
  });

  const categories = ['all', 'Revenue Quality', 'Unit Economics', 'Capital Efficiency', 'Customer Health', 'Market Reality', 'Governance & Moat'];

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Page Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 mb-3">
          <Scale className="w-3.5 h-3.5 text-emerald-600" />
          <span>Institutional Benchmarking Repository</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight font-serif">
          Venture Capital Diligence Benchmarks & Methodology Standards
        </h1>
        <p className="text-sm text-zinc-600 max-w-3xl mt-2 leading-relaxed">
          Comprehensive master reference across <strong>a16z 16 Metrics</strong>, <strong>Sequoia Crucible</strong>, <strong>Bessemer Cloud Centaur</strong>, and <strong>Benchmark Venture Lens</strong>. Used by Investment Committees to audit startups and stress-test terminal valuations.
        </p>
      </div>

      {/* Guest Mode Notice */}
      {!isLoggedIn && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Guest Diligence Mode:</strong> Public framework methodologies and formulas are displayed. Sign in to compare target startup deal metrics against proprietary top-quartile thresholds.
            </span>
          </div>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('Sign in with your investor account to compare startup deals against institutional benchmarks.')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Sign In to Unlock Comparisons
            </button>
          )}
        </div>
      )}

      {/* 4 Core Framework Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-8">
        <button
          onClick={() => setActiveFramework('all')}
          className={`flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFramework === 'all'
              ? 'bg-[#059669] border-[#059669] text-white'
              : 'bg-white border-zinc-200 text-[#09090B] hover:border-zinc-400'
          }`}
        >
          <span className="text-xs uppercase font-semibold opacity-75">Master Suite</span>
          <span className="text-sm font-bold mt-1">All Frameworks</span>
          <span className="text-[11px] opacity-80 mt-0.5">16 Core Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveFramework('a16z')}
          className={`flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFramework === 'a16z'
              ? 'bg-[#059669] border-[#059669] text-white'
              : 'bg-white border-zinc-200 text-[#09090B] hover:border-zinc-400'
          }`}
        >
          <span className="text-xs uppercase font-semibold opacity-75">a16z Standards</span>
          <span className="text-sm font-bold mt-1">16 Metrics Matrix</span>
          <span className="text-[11px] opacity-80 mt-0.5">Revenue & Cohorts</span>
        </button>

        <button
          onClick={() => setActiveFramework('sequoia')}
          className={`flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFramework === 'sequoia'
              ? 'bg-[#059669] border-[#059669] text-white'
              : 'bg-white border-zinc-200 text-[#09090B] hover:border-zinc-400'
          }`}
        >
          <span className="text-xs uppercase font-semibold opacity-75">Sequoia Capital</span>
          <span className="text-sm font-bold mt-1">Crucible Moat</span>
          <span className="text-[11px] opacity-80 mt-0.5">Defensibility & Traps</span>
        </button>

        <button
          onClick={() => setActiveFramework('bessemer')}
          className={`flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFramework === 'bessemer'
              ? 'bg-[#059669] border-[#059669] text-white'
              : 'bg-white border-zinc-200 text-[#09090B] hover:border-zinc-400'
          }`}
        >
          <span className="text-xs uppercase font-semibold opacity-75">Bessemer Cloud</span>
          <span className="text-sm font-bold mt-1">Efficiency Score</span>
          <span className="text-[11px] opacity-80 mt-0.5">Burn Multiple & Payback</span>
        </button>

        <button
          onClick={() => setActiveFramework('benchmark')}
          className={`flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFramework === 'benchmark'
              ? 'bg-[#059669] border-[#059669] text-white'
              : 'bg-white border-zinc-200 text-[#09090B] hover:border-zinc-400'
          }`}
        >
          <span className="text-xs uppercase font-semibold opacity-75">Benchmark Lens</span>
          <span className="text-sm font-bold mt-1">Market Reality</span>
          <span className="text-[11px] opacity-80 mt-0.5">Pull & Concentration</span>
        </button>
      </div>

      {/* Deep-Dive Educational Hero for the Selected Framework */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-7 mb-8 shadow-sm">
        {activeFramework === 'all' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded border border-emerald-200">
                Unified Institutional Methodology
              </span>
              <span className="text-xs text-zinc-500 font-medium">Standardized IC Review Protocol</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              The Four Pillars of Institutional Investment Audits
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
              Tier-1 venture capital firms rarely evaluate startups using generic pitch metrics. Instead, institutional partners apply rigorous mathematical normalization, forensic cohort peeling, and adversarial stress testing. Below is the master repository of metrics, formulas, top-quartile standards, and interrogation questions applied by senior partners.
            </p>
          </div>
        )}

        {activeFramework === 'a16z' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded border border-emerald-200">
                Andreessen Horowitz (a16z)
              </span>
              <span className="text-xs text-zinc-500 font-medium">16 Metrics Framework</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              The a16z 16 Metrics: Quantitative Truth in Venture Capital
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
              Authored by Jeff Jordan, Anu Hariharan, and Frank Chen, the a16z 16 Metrics framework prevents partners from mistaking gross merchandise volume (GMV) for recognized software ARR, blended CAC for organic traction, and early retention decay for long-term customer lock-in.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-100 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">ARR Normalization</div>
                <div className="text-zinc-600 mt-0.5">Strict separation of software recurring license fees vs. transactional GMV flow.</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">Cohort Retention "Smile"</div>
                <div className="text-zinc-600 mt-0.5">Ensures customer cohort spend stabilizes and expands over 36 months.</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">Blended CAC Trap</div>
                <div className="text-zinc-600 mt-0.5">Unmasks expensive paid acquisition hidden behind press spikes and word-of-mouth.</div>
              </div>
            </div>
          </div>
        )}

        {activeFramework === 'sequoia' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-xs font-semibold rounded border border-blue-200">
                Sequoia Capital
              </span>
              <span className="text-xs text-zinc-500 font-medium">The Crucible Diligence Framework</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              The Sequoia Crucible: Defensibility, Moats, and Founder Candor
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
              The Sequoia Crucible audits whether a company has a defensible business model that will endure technological paradigm shifts. It focuses on adversarial partner interrogatories: Can an incumbent clone this in 3 months? Are unit economics real? Is the founder transparent about churn?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-100 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">Moat Vulnerability</div>
                <div className="text-zinc-600 mt-0.5">Tests vulnerability to hyperscaler commoditization (e.g., AWS, OpenAI, Microsoft).</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">Adversarial Interrogatories</div>
                <div className="text-zinc-600 mt-0.5">5 high-pressure questions designed to reveal hidden churn and unit economic flaws.</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">ESOP Reserve Integrity</div>
                <div className="text-zinc-600 mt-0.5">Guarantees unallocated option pool is &gt;12% to prevent immediate dilution.</div>
              </div>
            </div>
          </div>
        )}

        {activeFramework === 'bessemer' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded border border-emerald-200">
                Bessemer Venture Partners
              </span>
              <span className="text-xs text-zinc-500 font-medium">State of the Cloud & Centaur Metric</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Bessemer Cloud Standards: Efficiency Scores & Capital Multiples
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
              BVP pioneered the BVP Cloud Index, the Centaur metric ($100M ARR milestone), the Burn Multiple, and the Efficiency Score. Bessemer benchmarks dictate capital efficiency thresholds: how many dollars of net cash burn does it take to generate $1 of net new ARR?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-100 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">Bessemer Burn Multiple</div>
                <div className="text-zinc-600 mt-0.5">Top-quartile is &lt;0.8x burn per $1 net new ARR; &gt;2.0x signals major capital waste.</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">CAC Payback Quotas</div>
                <div className="text-zinc-600 mt-0.5">Requires gross margin-adjusted payback under 12 months for scalable go-to-market.</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">The Rule of 40</div>
                <div className="text-zinc-600 mt-0.5">YoY Revenue Growth Rate + FCF Margin must exceed 40% for sustainable tier-1 valuation.</div>
              </div>
            </div>

            {/* 4-Tier Burn Multiple Matrix Guide */}
            <div className="mt-5 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-2 mb-2.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                  Bessemer & Craft Ventures: Burn Multiple Efficiency Tier Standards
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {BURN_MULTIPLE_TIERS.map((tier) => (
                  <div key={tier.tier} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">{tier.label}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeClass}`}>
                          {tier.rangeLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">{tier.description}</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-200/80 text-[10px] text-zinc-500 font-medium">
                      <strong className="text-zinc-700">IC Mandate:</strong> {tier.vcImplication}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeFramework === 'benchmark' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-xs font-semibold rounded border border-blue-200">
                Benchmark
              </span>
              <span className="text-xs text-zinc-500 font-medium">Venture Reality & Organic Pull</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Benchmark Venture Lens: Market Pull, Not Pushed Revenue
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
              The Benchmark approach, famous for early bets on Uber, eBay, Twitter, and modern enterprise leaders, evaluates raw market pull. If a startup requires excessive outbound sales aggression and price slashing to hit quota, it lacks true product-market fit.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-100 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">Organic Pull Ratio</div>
                <div className="text-zinc-600 mt-0.5">&gt;60% of enterprise pipeline must originate from word-of-mouth or developer pull.</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">Customer Concentration</div>
                <div className="text-zinc-600 mt-0.5">No single client &gt;10% of revenue. Over-reliance on one buyer destroys exit value.</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-900">Terminal Value Sanity</div>
                <div className="text-zinc-600 mt-0.5">Exit modeling grounded in realistic 6x–10x ARR multiples, not peak ZIRP bubbles.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-white border border-zinc-200 rounded-2xl p-3.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search metric name, formula, or concept..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-[#09090B] placeholder-zinc-400 focus:outline-none focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
          <span className="text-xs text-zinc-400 font-medium shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#059669] text-white font-semibold'
                  : 'bg-zinc-100 text-[#09090B] hover:bg-zinc-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Metric Cards Master Grid */}
      <div className="space-y-4 mb-12">
        <div className="text-xs uppercase font-medium text-zinc-500 px-1 flex items-center justify-between">
          <span>Showing {filteredMetrics.length} Verified VC Institutional Benchmarks</span>
          <span className="text-[11px] text-zinc-400">Click any deal to audit these live</span>
        </div>

        {filteredMetrics.map((metric) => {
          const frameworkBadgeColor =
            metric.framework === 'a16z'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : metric.framework === 'bessemer'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-blue-50 text-blue-800 border-blue-200';

          return (
            <div
              key={metric.id}
              className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-sm hover:border-zinc-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${frameworkBadgeColor}`}>
                      {metric.framework === 'a16z'
                        ? 'a16z 16 Metrics'
                        : metric.framework === 'bessemer'
                        ? 'Bessemer Cloud'
                        : metric.framework === 'sequoia'
                        ? 'Sequoia Crucible'
                        : 'Benchmark Lens'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                      {metric.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900">{metric.name}</h3>
                  <div className="mt-1 text-xs text-zinc-500 font-mono bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200/80 inline-block">
                    Formula: {metric.formula}
                  </div>

                  <p className="text-xs text-zinc-600 mt-2.5 leading-relaxed">
                    {metric.diligenceContext}
                  </p>
                </div>

                {/* Right: Targets & Quartiles Snapshot */}
                <div className="lg:w-80 shrink-0 space-y-2 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-zinc-100 lg:pl-5 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Top-Quartile Standard</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900 mt-0.5">
                      {metric.topQuartile}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200/50">
                    <div className="text-[11px] font-bold text-blue-800 uppercase">
                      Median / Acceptable Benchmark
                    </div>
                    <div className="text-xs text-zinc-800 mt-0.5">
                      {metric.median}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/70">
                    <div className="text-[11px] font-bold text-rose-700 uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>IC Red Flag Trigger</span>
                    </div>
                    <div className="text-xs text-rose-950/80 mt-0.5">
                      {metric.redFlag}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diligence Interrogation Question */}
              <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-start gap-2 bg-zinc-50/70 p-3 rounded-xl border border-zinc-200/60 text-xs">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900">Partner Audit Question: </span>
                  <span className="text-zinc-700">{metric.auditQuestion}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Institutional Subsector Diligence Rubric (a16z & Benchmark Guidelines) */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 mb-12 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                Industry-Specific Diligence Standards
              </span>
              <span className="text-xs text-zinc-500 font-medium">Vertical Hurdle Metrics</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mt-1 font-sans">
              Institutional Subsector Rubric (a16z & Benchmark Guidelines)
            </h3>
            <p className="text-xs text-zinc-600 mt-1 max-w-3xl leading-relaxed">
              Standardized investment hurdles, unit margin verification, and regulatory compliance criteria across specialized industry verticals.
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 bg-zinc-100 rounded-xl text-zinc-700 font-semibold border border-zinc-200 self-start sm:self-auto shrink-0">
            4 Core VC Sectors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subsector 1: Enterprise AI & Agents */}
          <div className="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200 hover:border-blue-300 hover:bg-white transition-all shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200/70">
                <div className="p-2 bg-blue-100/70 text-blue-700 rounded-xl">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Enterprise AI & Agents</h4>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Foundation & Agentic Stack</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-zinc-700 mt-3 font-medium">
                Verify inference token pass-through costs in COGS. Target post-inference gross margin &gt; 70%. Audited SOC2 Type II and zero-retention SLA required.
              </p>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-zinc-200/70 text-[11px]">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Gross Margin Target:</span>
                <strong className="text-emerald-700">&gt; 70% Post-Inference</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Security / IP SLA:</span>
                <strong className="text-zinc-900">Zero Model Retraining</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>IC Red Flag:</span>
                <strong className="text-rose-700">Thin API wrapper margin drag</strong>
              </div>
            </div>
          </div>

          {/* Subsector 2: Fintech & Payments */}
          <div className="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200 hover:border-emerald-300 hover:bg-white transition-all shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200/70">
                <div className="p-2 bg-emerald-100/70 text-emerald-700 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Fintech & Payments</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Embedded Finance & Rails</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-zinc-700 mt-3 font-medium">
                Net take rate 1.5% - 2.5% sustained. Dual-sponsor bank redundancy mandatory (avoid single BaaS point of failure). NPL delinquency rate &lt; 1.5%.
              </p>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-zinc-200/70 text-[11px]">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Net Take Rate:</span>
                <strong className="text-emerald-700">1.5% – 2.5% Sustained</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Sponsor Bank Setup:</span>
                <strong className="text-zinc-900">Dual-BaaS Redundancy</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Credit Hurdle:</span>
                <strong className="text-rose-700">NPL Delinquency &lt; 1.5%</strong>
              </div>
            </div>
          </div>

          {/* Subsector 3: HealthTech & RPM */}
          <div className="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200 hover:border-blue-300 hover:bg-white transition-all shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200/70">
                <div className="p-2 bg-blue-100/70 text-blue-700 rounded-xl">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">HealthTech & RPM</h4>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Clinical SaaS & Devices</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-zinc-700 mt-3 font-medium">
                510(k) substantial equivalence letter verified. Medicare CPT code adherence (16-day transmission threshold). 9-14 month enterprise hospital procurement runway buffer.
              </p>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-zinc-200/70 text-[11px]">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Regulatory Clearance:</span>
                <strong className="text-zinc-900">FDA 510(k) Verified</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Billing Compliance:</span>
                <strong className="text-emerald-700">16-day CPT Transmission</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Sales Cycle Buffer:</span>
                <strong className="text-blue-700">9–14 mo Procurement</strong>
              </div>
            </div>
          </div>

          {/* Subsector 4: Connected Devices & HaaS */}
          <div className="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200 hover:border-emerald-300 hover:bg-white transition-all shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200/70">
                <div className="p-2 bg-emerald-100/70 text-emerald-700 rounded-xl">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Connected Devices & HaaS</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Hardware-Enabled SaaS</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-zinc-700 mt-3 font-medium">
                Hardware BOM gross margin 50-60%. Factory RMA defect rate strictly &lt; 2.0%. Recurring cloud software attach rate &gt; 75% upon hardware renewal.
              </p>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-zinc-200/70 text-[11px]">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Hardware BOM Margin:</span>
                <strong className="text-zinc-900">50% – 60% Gross Margin</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Quality Benchmark:</span>
                <strong className="text-emerald-700">RMA Defect &lt; 2.0%</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>SaaS Attach Rate:</span>
                <strong className="text-emerald-700">&gt; 75% on Renewal</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
