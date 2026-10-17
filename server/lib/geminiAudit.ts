import { vcDiligenceAgent } from "../agent/vcDiligenceAgent.ts";
import type { FullDiligenceReport, GroundingEvaluationReport } from "../../src/types.ts";

/**
 * Executes an institutional VC diligence audit coordinated by the Pitch Black
 * Diligence Agent and its specialized expert skills:
 * - Financial & Benchmark Auditor Skill (a16z 16 metrics & cohort decay)
 * - Forensic Data Gap & Omission Auditor Skill (concealed liabilities)
 * - Subsector Specialized Diligence Skill (vertical lens checks)
 * - Investment Committee Signal Skill (traffic light & 5-factor scorecard)
 */
export async function generateAuditWithGemini(
  pitchText: string,
  sectorHint?: string,
  companyNameHint?: string,
  stageHint?: string
): Promise<FullDiligenceReport> {
  return vcDiligenceAgent.runAudit({
    pitchText,
    sectorHint,
    companyNameHint,
    stageHint,
  });
}

/**
 * Conducts interactive partner-level diligence inquiries through the
 * Copilot Advisor Skill.
 */
export async function generateCopilotAnswer(
  query: string,
  reportContext: any
): Promise<string> {
  return vcDiligenceAgent.askCopilot(query, reportContext);
}

/**
 * Evaluates the grounding and hallucination metrics of a report against raw pitch text
 */
export async function evaluateGroundingWithGemini(
  pitchText: string,
  report: FullDiligenceReport
): Promise<GroundingEvaluationReport> {
  return vcDiligenceAgent.evaluateGrounding(pitchText, report);
}

export { vcDiligenceAgent };
export { extractGeminiStatusCode, GeminiApiError } from "../agent/vcDiligenceAgent.ts";

