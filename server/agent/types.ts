export type DiligenceDomain =
  | 'financial_metrics'
  | 'forensic_risk'
  | 'subsector_lens'
  | 'investment_signal'
  | 'copilot_advisor';

export interface DiligenceSkill {
  id: string;
  name: string;
  description: string;
  version: string;
  domain: DiligenceDomain;
  getSystemInstruction(): string;
  getDomainRules(): string;
  rawMarkdown?: string;
  sourcePath?: string;
}

export interface AuditInput {
  pitchText: string;
  sectorHint?: string;
  companyNameHint?: string;
  stageHint?: string;
}
