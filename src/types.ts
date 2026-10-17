export type InvestmentSignal = 'HIGH_CONVICTION' | 'CONDITIONAL' | 'REJECT_PASS';

export interface ScorecardFactor {
  score: number;
  max: number;
  title?: string;
  notes: string;
}

export interface AnalysisReport {
  generated_at?: string;
  ticker?: string;
  summary?: string;
  quant_data?: any;
  fundamental_data?: any;
  insider_data?: any;
  downside_thesis?: any;
  financial_charts?: any;
  final_report?: string;
  chartImage?: string;
}

export interface RawAnalysisReport extends AnalysisReport {}

export type StartupCategory = 'fintech' | 'healthtech' | 'enterprise_ai' | 'iot_hardware' | 'saas' | string;
export interface VCReportData extends Record<string, any> {}
export interface AgentStepProgress extends Record<string, any> {}
export interface VCMetricItem extends Record<string, any> {}
export interface FlagItem extends Record<string, any> {}
export interface FounderQuestion extends Record<string, any> {}
export interface MissingInfoItem extends Record<string, any> {}

export interface ReportData {
  verdict?: {
    summary: string;
    conviction_score: number;
    key_takeaways: string[];
  };
  deep_insights?: any[];
  findings?: any[];
  financial_charts?: any;
}

export interface Scorecard {
  founderTeam: ScorecardFactor;
  marketTam: ScorecardFactor;
  productMoat: ScorecardFactor;
  unitEconomics: ScorecardFactor;
  diligenceRisk: ScorecardFactor;
}

export interface SignalDetails {
  signal: InvestmentSignal;
  convictionScore: number;
  badgeLabel: string;
  verdictSummary: string;
  partnerDirective: string;
  bullCase: string;
  baseCase: string;
  bearCase: string;
  scorecard: Scorecard;
}

export interface QuantitativeMetric {
  id: string;
  name: string;
  reported: string;
  topQuartile: string;
  median: string;
  status: 'TOP_QUARTILE' | 'MEDIAN' | 'UNDERPERFORMING';
  formula: string;
  analysis: string;
  institutionalStandard: string;
}

export interface HistoricalQuarter {
  quarter: string;
  arr: number; // in $M
  revenue: number; // in $M
  grossProfit: number; // in $M
  netBurn: number; // in $M
  ndr: number; // percentage
}

export interface CohortDecayPoint {
  month: string;
  reported: number;
  topQuartileBenchmark: number;
  underlyingReal: number;
}

export interface SubsectorCheckItem {
  pillar: string;
  status: 'PASS' | 'FLAG' | 'FAIL';
  metricValue: string;
  targetBenchmark: string;
  finding: string;
  institutionalRisk: string;
}

export interface SubsectorAudit {
  sector: 'ENTERPRISE_AI' | 'FINTECH' | 'HEALTHTECH' | 'IOT_HAAS' | 'GENERAL_SAAS';
  sectorName: string;
  overview: string;
  checks: SubsectorCheckItem[];
}

export interface ForensicOmission {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  surfaceClaim: string;
  concealedReality: string;
  financialImpact: string;
  remediationAction: string;
  urgency?: 'HIGH' | 'LOW';
  impact?: 'HIGH' | 'LOW';
  quadrantLabel?: string;
}

export interface DiligenceQuestion {
  id: string;
  cluster: 'Metrics & Financials' | 'Tech Architecture & AI Moat' | 'Regulatory & Ops' | 'Retention & Churn' | 'Team & Cap Table';
  question: string;
  intent: string;
  redFlagToWatchFor: string;
}

export interface BaselineFinancials {
  arr: number; // in $M
  cashOnHand: number; // in $M
  monthlyBurn: number; // in $M
  runwayMonths: number;
  grossMarginPct: number;
  blendedCac: number; // in $
  salesCycleDays: number;
  targetRaise: number; // in $M
  valuationClaim: number; // in $M
}

export interface FullDiligenceReport {
  companyName: string;
  sector: 'ENTERPRISE_AI' | 'FINTECH' | 'HEALTHTECH' | 'IOT_HAAS' | 'GENERAL_SAAS';
  stage: string;
  targetRaise: string;
  valuationClaim: string;
  generatedAt: string;
  isCustomPitch?: boolean;
  baseline: BaselineFinancials;
  signal: SignalDetails;
  metrics: QuantitativeMetric[];
  historicalQuarters: HistoricalQuarter[];
  cohortDecay: CohortDecayPoint[];
  subsectorAudit: SubsectorAudit;
  forensicGaps: ForensicOmission[];
  questionBank: DiligenceQuestion[];
}

export interface PitchBlackPreset {
  id: string;
  companyName: string;
  tagline: string;
  sector: 'ENTERPRISE_AI' | 'FINTECH' | 'HEALTHTECH' | 'IOT_HAAS' | 'GENERAL_SAAS';
  stage: string;
  targetRaise: string;
  valuationClaim: string;
  deckSummary: string;
  rawPitchText: string;
  report: FullDiligenceReport;
}

export interface PersistentDeal {
  id: string;
  ownerId: string;
  companyName: string;
  tagline: string;
  sector: 'ENTERPRISE_AI' | 'FINTECH' | 'HEALTHTECH' | 'IOT_HAAS' | 'GENERAL_SAAS';
  stage: string;
  targetRaise: string;
  valuationClaim: string;
  deckSummary: string;
  rawPitchText?: string;
  signal: InvestmentSignal;
  convictionScore: number;
  verdictSummary: string;
  report: FullDiligenceReport;
  isPreset?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GroundingItemType =
  | 'DIRECT_PITCH_SOURCE'
  | 'MATHEMATICAL_CALCULATION'
  | 'PURE_SYNTHESIS_ALERT';

export interface PurelySynthesizedItem {
  id: string;
  pillar: string;
  pillarId: number;
  item: string;
  claimInReport: string;
  whySynthesized: string;
  investorAlert: string;
  severity: 'CRITICAL' | 'WARNING';
}

export interface GroundingLedgerItem {
  id: string;
  category: string;
  pillar: string;
  pillarId: number;
  item: string;
  type: GroundingItemType;
  sourceValue: string;
  reportValue: string;
  formulaOrCitation?: string;
  explanation: string;
}

export interface GroundingEvaluationReport {
  score: number; // 0.0 to 10.0
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  hallucinationRisk: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH';
  evaluationSummary: string;
  purelySynthesizedItems: PurelySynthesizedItem[];
  purelySynthesizedCount: number;
  mathematicalDerivationsCount: number;
  groundedSourceCount: number;
  ledgerItems: GroundingLedgerItem[];
  sourceWordCount: number;
  evaluatedAt: string;
  evaluationMethod: 'AI_DEEP_EVALUATION' | 'HEURISTIC_PARSER';
}
