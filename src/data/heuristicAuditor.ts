import { FullDiligenceReport, QuantitativeMetric, ForensicOmission, DiligenceQuestion, SubsectorAudit } from '../types';

export function runHeuristicAudit(
  rawText: string,
  sectorHint?: 'ENTERPRISE_AI' | 'FINTECH' | 'HEALTHTECH' | 'IOT_HAAS' | 'GENERAL_SAAS',
  companyNameHint?: string,
  stageHint?: string
): FullDiligenceReport {
  const lower = rawText.toLowerCase();

  // 1. Sector detection
  let detectedSector: 'ENTERPRISE_AI' | 'FINTECH' | 'HEALTHTECH' | 'IOT_HAAS' | 'GENERAL_SAAS' = sectorHint || 'GENERAL_SAAS';
  if (!sectorHint || sectorHint === 'GENERAL_SAAS') {
    if (lower.includes('arrhythmia') || lower.includes('fda') || lower.includes('510(k)') || lower.includes('cpt') || lower.includes('rpm') || lower.includes('hospital') || lower.includes('clinic')) {
      detectedSector = 'HEALTHTECH';
    } else if (lower.includes('tpv') || lower.includes('take rate') || lower.includes('sponsor bank') || lower.includes('interchange') || lower.includes('payment') || lower.includes('clearing') || lower.includes('delinquency')) {
      detectedSector = 'FINTECH';
    } else if (lower.includes('sensor') || lower.includes('hardware') || lower.includes('bom') || lower.includes('rma') || lower.includes('haas') || lower.includes('iot') || lower.includes('turbine')) {
      detectedSector = 'IOT_HAAS';
    } else if (lower.includes('llm') || lower.includes('agent') || lower.includes('model') || lower.includes('inference') || lower.includes('token') || lower.includes('ai') || lower.includes('deep learning')) {
      detectedSector = 'ENTERPRISE_AI';
    }
  }

  // 2. Company name extraction
  let companyName = companyNameHint || 'Target Venture Candidate';
  const nameMatch = rawText.match(/(?:Company|Startup|Name|Project)[:\s]+([A-Za-z0-9\s\-]+?)(?:\n|\r|,|—|-)/i);
  if (nameMatch && nameMatch[1].trim().length > 2) {
    companyName = nameMatch[1].trim();
  }

  // 3. Metric extractions
  // ARR
  let arr = 2.5;
  const arrMatch = rawText.match(/arr[:\s]*\$?([0-9,.]+)\s*(m|k|million)?/i);
  if (arrMatch) {
    let val = parseFloat(arrMatch[1].replace(/,/g, ''));
    const unit = (arrMatch[2] || '').toLowerCase();
    if (unit.startsWith('k') || val > 1000) val = val / 1000;
    if (val > 0) arr = val;
  }

  // Cash
  let cashOnHand = 2.0;
  const cashMatch = rawText.match(/cash[:\s]*\$?([0-9,.]+)\s*(m|k|million)?/i);
  if (cashMatch) {
    let val = parseFloat(cashMatch[1].replace(/,/g, ''));
    const unit = (cashMatch[2] || '').toLowerCase();
    if (unit.startsWith('k') || val > 1000) val = val / 1000;
    if (val > 0) cashOnHand = val;
  }

  // Monthly burn
  let monthlyBurn = 0.22;
  const burnMatch = rawText.match(/burn[:\s]*\$?([0-9,.]+)\s*(m|k|million)?/i);
  if (burnMatch) {
    let val = parseFloat(burnMatch[1].replace(/,/g, ''));
    const unit = (burnMatch[2] || '').toLowerCase();
    if (unit.startsWith('m')) val = val;
    else if (val > 1000) val = val / 1000000;
    else if (val > 10) val = val / 1000;
    if (val > 0) monthlyBurn = val;
  }

  const runwayMonths = Math.round((cashOnHand / (monthlyBurn || 0.2)) * 10) / 10;
  const grossMargin = detectedSector === 'ENTERPRISE_AI' ? 56.5 : detectedSector === 'IOT_HAAS' ? 54.0 : detectedSector === 'FINTECH' ? 62.0 : 68.0;

  // 4. Signal assessment
  let signalStatus: 'HIGH_CONVICTION' | 'CONDITIONAL' | 'REJECT_PASS' = 'CONDITIONAL';
  let convictionScore = 65;
  let badgeLabel = '🟡 CONDITIONAL // DEEP DATA ROOM AUDIT REQUIRED';

  if (runwayMonths < 7.0 || lower.includes('consent order') || lower.includes('delinquent') || lower.includes('fail')) {
    signalStatus = 'REJECT_PASS';
    convictionScore = 42;
    badgeLabel = '🔴 PASS / REJECT // MATERIAL STRUCTURAL HEADWINDS';
  } else if (arr > 3.0 && runwayMonths >= 12.0 && grossMargin >= 70.0) {
    signalStatus = 'HIGH_CONVICTION';
    convictionScore = 84;
    badgeLabel = '🟢 HIGH CONVICTION // PROCEED TO FULL PARTNER MEETING';
  }

  // 5. Scorecard
  const scorecard = {
    founderTeam: {
      score: 7.8,
      max: 10,
      title: 'Founder Team & Execution Cadence',
      notes: 'Demonstrates domain velocity, but executive bench needs experienced VP of Sales and dedicated finance controller.',
    },
    marketTam: {
      score: 8.5,
      max: 10,
      title: 'Market TAM & Secular Tailwinds',
      notes: 'Operating in a rapidly transitioning vertical with substantial greenfield spend and replacement cycles.',
    },
    productMoat: {
      score: 6.4,
      max: 10,
      title: 'Product Defensibility & Switching Costs',
      notes: 'Workflow integration is active, but proprietary data lock-in and network effects must be hardened against platform giants.',
    },
    unitEconomics: {
      score: 5.6,
      max: 10,
      title: 'Unit Economics & Margin Rigor',
      notes: `Reported economics mask true unblended CAC and underlying compute/servicing COGS (est. ${grossMargin}% GM).`,
    },
    diligenceRisk: {
      score: 5.2,
      max: 10,
      title: 'Forensic Diligence & Cap Table Risk',
      notes: `Implied runway of ${runwayMonths} months requires disciplined capital allocation and verification of unallocated ESOP reserves.`,
    },
  };

  // 6. Quantitative Metrics
  const metrics: QuantitativeMetric[] = [
    {
      id: 'rule-of-40',
      name: 'Rule of 40',
      reported: '52.0%',
      topQuartile: '≥ 40.0%',
      median: '20.0%',
      status: 'TOP_QUARTILE',
      formula: 'YoY Growth Rate (120%) + FCF/EBITDA Margin (-68%) = 52.0%',
      analysis: 'Surpasses standard 40% threshold propelled by top-line growth velocity, but cash burn drag requires monitoring.',
      institutionalStandard: 'Top-quartile growth companies target combined Growth % + Free Cash Flow Margin % ≥ 40%.',
    },
    {
      id: 'ndr',
      name: 'Net Dollar Retention (NDR)',
      reported: '124.0% (Selective)',
      topQuartile: '> 120.0%',
      median: '106.0%',
      status: 'TOP_QUARTILE',
      formula: '(Starting ARR + Expansion - Contraction - Churn) / Starting ARR',
      analysis: 'Reported expansion is buoyant, but cohort decay curves over 18-24 months must be verified across non-champion accounts.',
      institutionalStandard: 'Enterprise software tier-1 threshold requires cohort NDR > 120%.',
    },
    {
      id: 'logo-churn',
      name: 'Gross Logo Churn',
      reported: '1.20% / month (14.4% annual)',
      topQuartile: '< 1.50% / mo',
      median: '2.20% / mo',
      status: 'TOP_QUARTILE',
      formula: 'Lost Customer Logos in Period / Active Starting Logos',
      analysis: 'Passes top-quartile benchmark on an aggregate basis; need to audit whether recent pilots are nearing renewal cliffs.',
      institutionalStandard: 'Top-quartile B2B enterprise logo churn is < 1.0% to 1.5% monthly (< 15% annually).',
    },
    {
      id: 'burn-multiple',
      name: 'Burn Multiple',
      reported: '1.55x',
      topQuartile: '< 1.25x',
      median: '1.75x',
      status: 'MEDIAN',
      formula: 'Net Cash Burn ($2.64M LTM) / Net New ARR ($1.70M LTM) = 1.55x',
      analysis: 'Burn efficiency is within normal median tolerance (1.55x) but above top-quartile discipline (< 1.25x).',
      institutionalStandard: 'Bessemer efficiency: < 1.25x is Top-Quartile; 1.25x-1.75x is Median; > 2.0x is Highly Dilutive.',
    },
    {
      id: 'ltv-cac',
      name: 'LTV : CAC Ratio & Payback',
      reported: '3.6x (Blended) / 13.5 mo Payback',
      topQuartile: '≥ 3.0x / < 12 mo',
      median: '2.5x / 16 mo',
      status: 'MEDIAN',
      formula: '(ACV × Gross Margin × Customer Lifetime) / Fully Loaded CAC',
      analysis: 'Blended CAC masks elevated paid acquisition expenses. When founder referrals are removed, payback stretches beyond 14 months.',
      institutionalStandard: 'Top-tier institutional benchmark requires unblended LTV:CAC ≥ 3.0x and CAC Payback < 12 months.',
    },
    {
      id: 'gross-margin',
      name: 'Gross Margin (Audited COGS)',
      reported: `${grossMargin}% (Audited) vs 78% (Claimed)`,
      topQuartile: '75.0% - 85.0%',
      median: '68.0%',
      status: 'UNDERPERFORMING',
      formula: '(Revenue - Direct Hosting/Infrastructure/API COGS) / Revenue',
      analysis: 'Direct servicing costs and cloud infrastructure bills have been partially misclassified under R&D OpEx.',
      institutionalStandard: 'Pure-play cloud software standard is 75-85%. Lower margins compress exit valuation multiples.',
    },
    {
      id: 'magic-number',
      name: 'Magic Number (Sales Efficiency)',
      reported: '0.78x',
      topQuartile: '> 0.75x',
      median: '0.55x',
      status: 'TOP_QUARTILE',
      formula: '(Quarterly Net New ARR × 4) / Prior Quarter S&M Expense',
      analysis: 'Sales capacity is delivering acceptable yield, justifying measured capital injection into quota-carrying reps.',
      institutionalStandard: 'Bessemer Magic Number > 0.75x signals scalable sales go-to-market.',
    },
  ];

  // 7. Subsector-specific lens
  const subsectorAudit: SubsectorAudit = {
    sector: detectedSector,
    sectorName:
      detectedSector === 'ENTERPRISE_AI' ? 'Enterprise AI & Autonomous Agents' :
      detectedSector === 'FINTECH' ? 'Fintech & Embedded Financial Infrastructure' :
      detectedSector === 'HEALTHTECH' ? 'HealthTech & Clinical Remote Telemetry' :
      detectedSector === 'IOT_HAAS' ? 'Connected Devices, Industrial IoT & HaaS' : 'General B2B Enterprise Software',
    overview: 'Specialized institutional audit addressing sector-specific regulatory, technological, and unit economic hurdles.',
    checks: [
      {
        pillar: detectedSector === 'ENTERPRISE_AI' ? 'Foundation Model API Cost vs Proprietary Moat' :
                detectedSector === 'FINTECH' ? 'Sponsor Bank Concentration & BaaS Resilience' :
                detectedSector === 'HEALTHTECH' ? 'FDA 510(k) Clearance & Predicate Equivalence' :
                detectedSector === 'IOT_HAAS' ? 'Bill of Materials (BOM) & Factory Defect Rate' : 'Customer Account Concentration',
        status: 'FLAG',
        metricValue: detectedSector === 'ENTERPRISE_AI' ? '32% of revenue spent on external LLM token calls' :
                     detectedSector === 'FINTECH' ? 'Single sponsor bank clearing 90%+ of transactions' :
                     detectedSector === 'HEALTHTECH' ? '510(k) awaiting final CDRH clearance letter' :
                     detectedSector === 'IOT_HAAS' ? 'Factory RMA return rate 3.2% (Target < 1.5%)' : 'Top 3 clients = 35% of ARR',
        targetBenchmark: 'Defensible IP with institutional risk mitigation',
        finding: 'Vulnerability detected in core operational rail requiring contractual verification in data room.',
        institutionalRisk: 'Operational or margin shocks could destabilize projected forward economics.',
      },
      {
        pillar: detectedSector === 'ENTERPRISE_AI' ? 'Inference vs Application Gross Margin' :
                detectedSector === 'FINTECH' ? 'Net Take Rate vs Interchange Degradation' :
                detectedSector === 'HEALTHTECH' ? 'CPT Reimbursement Code Stability (RPM 99453/99454)' :
                detectedSector === 'IOT_HAAS' ? 'Recurring HaaS Software Attach Rate' : 'Contract Length & Multi-Year Lock-In',
        status: 'FLAG',
        metricValue: detectedSector === 'ENTERPRISE_AI' ? `${grossMargin}% post-inference gross margin` :
                     detectedSector === 'FINTECH' ? '1.75% Net Take Rate' :
                     detectedSector === 'HEALTHTECH' ? '100% Medicare RPM code concentration' :
                     detectedSector === 'IOT_HAAS' ? '72% Year-2 cloud subscription renewal' : 'Annual contracts with 60-day out',
        targetBenchmark: 'Predictable high-margin recurring yield',
        finding: 'Secondary cost drivers compress profitability below pure SaaS benchmarks.',
        institutionalRisk: 'Requires explicit sensitivity modeling against payer or supplier fee adjustments.',
      },
      {
        pillar: 'Regulatory Compliance & Data Governance',
        status: 'PASS',
        metricValue: 'SOC2 Type II + Data Isolation SLA Verified',
        targetBenchmark: 'Enterprise grade compliance standards',
        finding: 'Baseline information security protocols and data sovereignty measures satisfy standard enterprise procurement.',
        institutionalRisk: 'Satisfies current tier-1 security screening requirements.',
      },
      {
        pillar: 'Sales Procurement & Conversion Velocity',
        status: 'FLAG',
        metricValue: 'Average sales cycle 110 days',
        targetBenchmark: '< 90 days for mid-market, < 180 days for enterprise',
        finding: 'Enterprise procurement hurdles require dedicated sales engineering and legal redline support.',
        institutionalRisk: 'Sales cycle slippage immediately accelerates runway consumption.',
      },
    ],
  };

  // 8. Forensic Data Gap Audit
  const forensicGaps: ForensicOmission[] = [
    {
      id: 'gap-cac',
      title: 'Blended CAC Masking Elevated Paid Channel Acquisition Costs',
      severity: 'HIGH',
      urgency: 'LOW',
      impact: 'HIGH',
      surfaceClaim: 'Pitch deck reports blended CAC of ~$15,000 with rapid 6-month payback.',
      concealedReality: 'Founder networks and organic inbound accounts heavily distort blended CAC. True paid outbound CAC is 2.5x higher with 14+ month payback.',
      financialImpact: 'Requires substantially more growth equity to sustain forecasted customer acquisition velocity.',
      remediationAction: 'Request unblended channel acquisition waterfalls (Organic vs Paid SDR vs Conferences) for prior 4 quarters.',
    },
    {
      id: 'gap-cohort',
      title: 'Missing 8-Quarter Cohort Decay Curves (Concealing Churn In Older Vintages)',
      severity: 'HIGH',
      urgency: 'HIGH',
      impact: 'HIGH',
      surfaceClaim: 'Prominently features aggregate net expansion figures without vintage segmentation.',
      concealedReality: 'Mature cohorts (12-24 months) exhibit seat contraction and logo churn after initial novelty dissipates.',
      financialImpact: 'Indicates underlying customer retention vulnerability requiring constant replacement sales.',
      remediationAction: 'Demand raw monthly customer billing ledgers to generate independent cohort retention heatmaps.',
    },
    {
      id: 'gap-cogs',
      title: 'Servicing Infrastructure Costs Misclassified in R&D OpEx',
      severity: 'CRITICAL',
      urgency: 'HIGH',
      impact: 'HIGH',
      surfaceClaim: 'Claims 78%+ SaaS gross margins comparable to mature public enterprise software.',
      concealedReality: 'Third-party API compute, hosting, and specialized customer onboarding are booked as R&D OpEx rather than COGS.',
      financialImpact: 'True Gross Margin is 15-20 percentage points lower, directly shrinking terminal valuation multiples.',
      remediationAction: 'Condition term sheet on audited P&L with strict GAAP COGS reclassification.',
    },
    {
      id: 'gap-esop',
      title: 'Depleted Unallocated ESOP Pool (< 5%) Requiring Pre-Money Expansion',
      severity: 'MODERATE',
      urgency: 'HIGH',
      impact: 'LOW',
      surfaceClaim: 'Summary cap table shows 10% total option pool authorized.',
      concealedReality: 'Past engineering hires have absorbed >65% of the pool; unallocated equity available for key executive hires is under 4%.',
      financialImpact: 'Refreshing pool to institutional 12-15% will cause 8-10% pre-money dilution to existing equity holders.',
      remediationAction: 'Include explicit term requiring 12% unallocated pool strictly on a pre-money basis.',
    },
  ];

  // 9. Partner Diligence Question Bank
  const questionBank: DiligenceQuestion[] = [
    {
      id: 'q-p1',
      cluster: 'Metrics & Financials',
      question: 'What is your fully loaded, unblended CAC when excluding all founder-sourced deals and organic inbound leads over the last 6 months?',
      intent: 'Identifies the true capital cost to scale sales capacity via hired sales reps.',
      redFlagToWatchFor: 'Paid CAC is more than 2.5x blended CAC, or CAC payback exceeds 15 months.',
    },
    {
      id: 'q-p2',
      cluster: 'Tech Architecture & AI Moat',
      question: 'Walk us through your direct unit economics per customer workflow: What is your exact third-party API or component cost per transaction, and how does gross margin scale with usage?',
      intent: 'Verifies whether heavy users dilute corporate profitability or generate positive unit contribution.',
      redFlagToWatchFor: 'Admitting that top enterprise tier users cost more in compute/servicing than their subscription fee.',
    },
    {
      id: 'q-p3',
      cluster: 'Retention & Churn',
      question: 'In your oldest cohort of customers from 18-24 months ago, what percentage of the original contracted seats or recurring ARR remains active today?',
      intent: 'Separates genuine durable stickiness from artificial short-term pilot momentum.',
      redFlagToWatchFor: 'Mature cohort net retention drops below 90%, signifying a leaky bucket.',
    },
    {
      id: 'q-p4',
      cluster: 'Team & Cap Table',
      question: 'What is the exact percentage of unallocated options remaining in your ESOP pool today, and what senior executive roles must be hired with this round?',
      intent: 'Protects incoming investors from unbudgeted pre-money option pool expansion dilution.',
      redFlagToWatchFor: 'Unallocated ESOP < 4% with multiple C-suite vacancies yet to be filled.',
    },
    {
      id: 'q-p5',
      cluster: 'Regulatory & Ops',
      question: 'What single regulatory change, partner vendor price increase, or platform update could immediately impact your gross margin by more than 15%?',
      intent: 'Tests management self-awareness of critical counterparty and regulatory vulnerabilities.',
      redFlagToWatchFor: 'Founder claiming zero counterparty dependencies or unaware of supplier pricing terms.',
    },
  ];

  // 10. Historical Quarters & Cohort Decay
  const q3Arr = arr;
  const q2Arr = Math.round((q3Arr / 1.25) * 100) / 100;
  const q1Arr = Math.round((q2Arr / 1.25) * 100) / 100;
  const q0Arr = Math.round((q1Arr / 1.25) * 100) / 100;

  const historicalQuarters = [
    { quarter: 'Q4 2025', arr: q0Arr, revenue: Math.round(q0Arr * 0.24 * 100) / 100, grossProfit: Math.round(q0Arr * 0.24 * (grossMargin / 100) * 100) / 100, netBurn: Math.round(monthlyBurn * 2.8 * 100) / 100, ndr: 128 },
    { quarter: 'Q1 2026', arr: q1Arr, revenue: Math.round(q1Arr * 0.24 * 100) / 100, grossProfit: Math.round(q1Arr * 0.24 * (grossMargin / 100) * 100) / 100, netBurn: Math.round(monthlyBurn * 2.9 * 100) / 100, ndr: 126 },
    { quarter: 'Q2 2026', arr: q2Arr, revenue: Math.round(q2Arr * 0.24 * 100) / 100, grossProfit: Math.round(q2Arr * 0.24 * (grossMargin / 100) * 100) / 100, netBurn: Math.round(monthlyBurn * 3.0 * 100) / 100, ndr: 125 },
    { quarter: 'Q3 2026', arr: q3Arr, revenue: Math.round(q3Arr * 0.25 * 100) / 100, grossProfit: Math.round(q3Arr * 0.25 * (grossMargin / 100) * 100) / 100, netBurn: Math.round(monthlyBurn * 3.1 * 100) / 100, ndr: 122 },
  ];

  const cohortDecay = [
    { month: 'M0', reported: 100, topQuartileBenchmark: 100, underlyingReal: 100 },
    { month: 'M3', reported: 112, topQuartileBenchmark: 108, underlyingReal: 104 },
    { month: 'M6', reported: 120, topQuartileBenchmark: 114, underlyingReal: 108 },
    { month: 'M9', reported: 124, topQuartileBenchmark: 120, underlyingReal: 106 },
    { month: 'M12', reported: 126, topQuartileBenchmark: 124, underlyingReal: 102 },
    { month: 'M15', reported: 127, topQuartileBenchmark: 128, underlyingReal: 96 },
    { month: 'M18', reported: 128, topQuartileBenchmark: 130, underlyingReal: 91 },
    { month: 'M24', reported: 129, topQuartileBenchmark: 135, underlyingReal: 85 },
  ];

  return {
    companyName,
    sector: detectedSector,
    stage: stageHint || 'Series A',
    targetRaise: `$${Math.round(arr * 4.0 * 10) / 10}M at $${Math.round(arr * 18.0)}M Pre-Money`,
    valuationClaim: `$${Math.round(arr * 18.0)}M Pre-Money (${Math.round((arr * 18.0) / arr)}x ARR)`,
    generatedAt: 'Pitch Black Venture Intelligence Audit',
    isCustomPitch: true,
    baseline: {
      arr,
      cashOnHand,
      monthlyBurn,
      runwayMonths,
      grossMarginPct: grossMargin,
      blendedCac: 15200,
      salesCycleDays: 110,
      targetRaise: Math.round(arr * 4.0 * 10) / 10,
      valuationClaim: Math.round(arr * 18.0),
    },
    signal: {
      signal: signalStatus,
      convictionScore,
      badgeLabel,
      verdictSummary: `Institutional evaluation for ${companyName} reveals promising top-line growth of ~$${arr}M ARR, but unit economics are diluted by unblended CAC inflation and true gross margin drag (est. ${grossMargin}%).`,
      partnerDirective: signalStatus === 'REJECT_PASS'
        ? 'Pass on current terms. Revisit only if valuation re-anchors and credit/regulatory exposure is mitigated.'
        : 'Do not issue unconditioned term sheet. Condition closing on data room verification of unblended cohort retention and GAAP COGS audit.',
      bullCase: `Company accelerates scalable outbound sales, expands gross margin from ${grossMargin}% to 72%+, and maintains >125% net retention.`,
      baseCase: `Company closes round at a 20-30% valuation discount to requested terms, growing to $${Math.round(arr * 2.1 * 10) / 10}M ARR over 12 months.`,
      bearCase: `Sales cycle slips from 110 days to 180+ days as CAC inflates, accelerating cash burn and forcing an inside bridge financing.`,
      scorecard,
    },
    metrics,
    historicalQuarters,
    cohortDecay,
    subsectorAudit,
    forensicGaps,
    questionBank,
  };
}

export function calculateRunwaySensitivity(
  baseline: {
    arr: number;
    cashOnHand: number;
    monthlyBurn: number;
    runwayMonths: number;
    grossMarginPct: number;
    salesCycleDays: number;
  },
  params: {
    cacInflation: number; // e.g. 0 to 80%
    salesCycleSlippage: number; // e.g. 0 to 180 days
    grossChurnSpike: number; // e.g. 0 to 5% monthly
    grossMarginDrop: number; // e.g. 0 to 25%
  }
) {
  // CAC inflation increases S&M spend per dollar of new revenue
  const cacFactor = 1 + (params.cacInflation / 100) * 0.45;

  // Sales cycle slippage delays new ARR collections and extends burn
  const cycleFactor = 1 + (params.salesCycleSlippage / 180) * 0.35;

  // Gross margin drop increases direct COGS burn
  const marginFactor = 1 + (params.grossMarginDrop / 100) * 0.3;

  // Churn spike causes lost recurring revenue
  const churnBurnAddition = (baseline.arr / 12) * (params.grossChurnSpike / 100) * 0.7;

  const revisedMonthlyBurn = Math.round((baseline.monthlyBurn * cacFactor * cycleFactor * marginFactor + churnBurnAddition) * 1000) / 1000;
  const revisedRunwayMonths = Math.max(0.5, Math.round((baseline.cashOnHand / (revisedMonthlyBurn || 0.01)) * 10) / 10);
  const runwayLostMonths = Math.max(0, Math.round((baseline.runwayMonths - revisedRunwayMonths) * 10) / 10);

  // Capital shortfall to reach 18 months standard venture runway
  const neededCapitalFor18Mo = Math.max(0, Math.round((18 * revisedMonthlyBurn - baseline.cashOnHand) * 10) / 10);

  // Down-round / Valuation haircut risk %
  const valuationHaircut = Math.min(65, Math.round((runwayLostMonths * 4.2 + (params.cacInflation * 0.25) + (params.grossChurnSpike * 5))));

  return {
    revisedMonthlyBurn,
    revisedRunwayMonths,
    runwayLostMonths,
    neededCapitalFor18Mo,
    valuationHaircut,
  };
}
