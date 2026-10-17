import { GoogleGenAI } from "@google/genai";
import { DiligenceSkill, AuditInput } from "./types.ts";
import { loadAllMarkdownSkills } from "./skillLoader.ts";
import { runHeuristicAudit } from "../../src/data/heuristicAuditor.ts";
import type { FullDiligenceReport, GroundingEvaluationReport } from "../../src/types.ts";

export class GeminiApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number = 500) {
    super(`Gemini API issue(${statusCode})`);
    this.name = 'GeminiApiError';
    this.statusCode = statusCode;
  }
}

export function extractGeminiStatusCode(err: any): number {
  if (!err) return 500;
  if (err instanceof GeminiApiError) return err.statusCode;
  if (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600) {
    return err.statusCode;
  }
  if (typeof err.status === 'number' && err.status >= 400 && err.status < 600) {
    return err.status;
  }
  if (typeof err.code === 'number' && err.code >= 400 && err.code < 600) {
    return err.code;
  }

  const msg = typeof err === 'string' ? err : `${err?.message || ''} ${JSON.stringify(err || {})}`;

  const issueMatch = msg.match(/Gemini API issue\((\d{3})\)/i);
  if (issueMatch) return parseInt(issueMatch[1], 10);

  const jsonCodeMatch = msg.match(/"code"\s*:\s*(\d{3})/);
  if (jsonCodeMatch) return parseInt(jsonCodeMatch[1], 10);

  const statusMatch = msg.match(/\b(400|401|402|403|404|408|409|429|500|502|503|504)\b/);
  if (statusMatch) return parseInt(statusMatch[1], 10);

  if (
    msg.includes('INVALID_ARGUMENT') ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('API key not valid') ||
    msg.includes('pass a valid API key')
  ) {
    return 400;
  }
  if (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('prepayment') ||
    msg.includes('credits are depleted') ||
    msg.includes('quota')
  ) {
    return 402;
  }
  if (msg.includes('UNAUTHENTICATED') || msg.includes('is not configured')) {
    return 401;
  }
  if (msg.includes('PERMISSION_DENIED')) {
    return 403;
  }
  if (msg.includes('NOT_FOUND')) {
    return 404;
  }

  return 500;
}

export class VCDiligenceAgent {
  private skills: Map<string, DiligenceSkill> = new Map();

  constructor() {
    this.initSkills();
  }

  private initSkills(): void {
    const markdownSkills = loadAllMarkdownSkills();
    for (const skill of markdownSkills) {
      this.registerSkill(skill);
    }
  }

  public registerSkill(skill: DiligenceSkill): void {
    this.skills.set(skill.id, skill);
    console.log(`[VCDiligenceAgent] Registered expert skill: ${skill.name} (${skill.id} v${skill.version})`);
  }

  public getSkill(id: string): DiligenceSkill | undefined {
    return this.skills.get(id);
  }

  public getAllSkills(): DiligenceSkill[] {
    return Array.from(this.skills.values());
  }

  private getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'x-goog-api-client': 'pitch-black-vc-agent/2.0.0'
        }
      }
    });
  }

  public async runAudit(input: AuditInput): Promise<FullDiligenceReport> {
    const ai = this.getGeminiClient();
    if (!ai) {
      throw new GeminiApiError(400);
    }

    const { pitchText, sectorHint, companyNameHint, stageHint } = input;

    // Gather domain rules and instructions from all audit-specialist skills
    const finSkill = this.skills.get('skill-financial-audit')!;
    const forensicSkill = this.skills.get('skill-forensic-audit')!;
    const subsectorSkill = this.skills.get('skill-subsector-audit')!;
    const signalSkill = this.skills.get('skill-investment-signal')!;

    const combinedSkillInstructions = `
=== ACTIVE EXPERT SKILLS ORCHESTRATION ===
1. ${finSkill.name} (v${finSkill.version}):
${finSkill.getSystemInstruction()}
${finSkill.getDomainRules()}

2. ${forensicSkill.name} (v${forensicSkill.version}):
${forensicSkill.getSystemInstruction()}
${forensicSkill.getDomainRules()}

3. ${subsectorSkill.name} (v${subsectorSkill.version}):
${subsectorSkill.getSystemInstruction()}
${subsectorSkill.getDomainRules()}

4. ${signalSkill.name} (v${signalSkill.version}):
${signalSkill.getSystemInstruction()}
${signalSkill.getDomainRules()}
`;

    const prompt = `You are "Pitch Black Agent" — an institutional AI Venture Capital Diligence Orchestrator coordinating 4 specialized expert skills to audit a startup investment opportunity.

${combinedSkillInstructions}

=== TARGET STARTUP DATA & PITCH TRANSCRIPT ===
Company Name / Hint: ${companyNameHint || 'Auto-detect from pitch'}
Sector Hint: ${sectorHint || 'Auto-detect from pitch'}
Stage / Round Hint: ${stageHint || 'Auto-detect from pitch'}

TRANSCRIPT / PITCH MATERIALS:
"""
${pitchText}
"""

=== COORDINATED SYNTHESIS & OUTPUT FORMAT ===
Synthesize the audit findings across all active expert skills into a single, cohesive, institutional-grade JSON payload.
You MUST output ONLY valid JSON wrapped in a single \`\`\`json ... \`\`\` markdown codeblock.
Match this exact structure:
{
  "companyName": "string",
  "sector": "ENTERPRISE_AI" | "FINTECH" | "HEALTHTECH" | "IOT_HAAS" | "GENERAL_SAAS",
  "stage": "string",
  "targetRaise": "string (e.g. $15M Series A)",
  "valuationClaim": "string (e.g. $60M Post-Money)",
  "generatedAt": "Institutional Diligence Audit",
  "baseline": {
    "arr": number (in $M),
    "cashOnHand": number (in $M),
    "monthlyBurn": number (in $M),
    "runwayMonths": number,
    "grossMarginPct": number,
    "blendedCac": number (in $),
    "salesCycleDays": number,
    "targetRaise": number (in $M),
    "valuationClaim": number (in $M)
  },
  "signal": {
    "signal": "HIGH_CONVICTION" | "CONDITIONAL" | "REJECT_PASS",
    "convictionScore": number (0-100),
    "badgeLabel": "string",
    "verdictSummary": "string (2-3 unvarnished partner sentences)",
    "partnerDirective": "string (actionable investment directive)",
    "bullCase": "string",
    "baseCase": "string",
    "bearCase": "string",
    "scorecard": {
      "founderTeam": { "score": number (0-10), "max": 10, "title": "Founder Team & Execution Cadence", "notes": "string" },
      "marketTam": { "score": number (0-10), "max": 10, "title": "Market TAM & Secular Tailwinds", "notes": "string" },
      "productMoat": { "score": number (0-10), "max": 10, "title": "Product Defensibility & Switching Costs", "notes": "string" },
      "unitEconomics": { "score": number (0-10), "max": 10, "title": "Unit Economics & Margin Rigor", "notes": "string" },
      "diligenceRisk": { "score": number (0-10), "max": 10, "title": "Forensic Diligence & Cap Table Risk", "notes": "string" }
    }
  },
  "metrics": [
    {
      "id": "string",
      "name": "string (e.g. Rule of 40, Net Dollar Retention, Gross Logo Churn, Burn Multiple, LTV:CAC, CAC Payback, Gross Margin)",
      "reported": "string",
      "topQuartile": "string",
      "median": "string",
      "status": "TOP_QUARTILE" | "MEDIAN" | "UNDERPERFORMING",
      "formula": "string",
      "analysis": "string",
      "institutionalStandard": "string"
    }
  ],
  "historicalQuarters": [
    {
      "quarter": "string (e.g. Q1 2024)",
      "arr": number (in $M),
      "revenue": number (in $M),
      "grossProfit": number (in $M),
      "netBurn": number (in $M),
      "ndr": number (percentage e.g. 118)
    }
  ],
  "cohortDecay": [
    {
      "month": "M0" | "M3" | "M6" | "M9" | "M12" | "M15" | "M18" | "M24",
      "reported": number (percentage e.g. 100, 94, 88...),
      "topQuartileBenchmark": number (percentage),
      "underlyingReal": number (percentage)
    }
  ],
  "subsectorAudit": {
    "sector": "ENTERPRISE_AI" | "FINTECH" | "HEALTHTECH" | "IOT_HAAS" | "GENERAL_SAAS",
    "sectorName": "string",
    "overview": "string",
    "checks": [
      {
        "pillar": "string",
        "status": "PASS" | "FLAG" | "FAIL",
        "metricValue": "string",
        "targetBenchmark": "string",
        "finding": "string",
        "institutionalRisk": "string"
      }
    ]
  },
  "forensicGaps": [
    {
      "id": "string",
      "title": "string",
      "severity": "CRITICAL" | "HIGH" | "MODERATE",
      "urgency": "HIGH" | "LOW",
      "impact": "HIGH" | "LOW",
      "surfaceClaim": "string",
      "concealedReality": "string",
      "financialImpact": "string",
      "remediationAction": "string"
    }
  ],
  "questionBank": [
    {
      "id": "string",
      "cluster": "Metrics & Financials" | "Tech Architecture & AI Moat" | "Regulatory & Ops" | "Retention & Churn" | "Team & Cap Table",
      "question": "string",
      "intent": "string",
      "redFlagToWatchFor": "string"
    }
  ]
}`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[VCDiligenceAgent] Executing audit pipeline with model ${model}...`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.2,
            maxOutputTokens: 8192,
          },
        });

        const text = response.text || '';
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : text;

        const parsed = JSON.parse(jsonStr.trim());
        if (parsed && (parsed.signal || parsed.metrics)) {
          return this.normalizeReport(parsed, companyNameHint || '', sectorHint || '', stageHint || '');
        }
      } catch (err: any) {
        console.log(`[VCDiligenceAgent] Note on model ${model}:`, err?.status || err?.code || 'call failed');
        lastError = err;
      }
    }

    const statusCode = extractGeminiStatusCode(lastError);
    throw new GeminiApiError(statusCode);
  }

  public generateFallbackReport(input: AuditInput): FullDiligenceReport {
    const rawReport = runHeuristicAudit(
      input.pitchText,
      (input.sectorHint as any) || 'GENERAL_SAAS',
      input.companyNameHint,
      input.stageHint
    );
    return this.normalizeReport(
      rawReport,
      input.companyNameHint || rawReport.companyName || 'Target Startup',
      input.sectorHint || rawReport.sector || 'GENERAL_SAAS',
      input.stageHint || rawReport.stage || 'Series A'
    );
  }

  public async askCopilot(query: string, reportContext: any): Promise<string> {
    const ai = this.getGeminiClient();
    if (!ai) {
      throw new GeminiApiError(400);
    }

    const copilotSkill = this.skills.get('skill-copilot-advisor');
    const systemInst = copilotSkill ? copilotSkill.getSystemInstruction() : "You are the Principal AI Diligence Partner.";
    const domainRules = copilotSkill ? copilotSkill.getDomainRules() : "";

    const prompt = `${systemInst}

${domainRules}

ACTIVE STARTUP DILIGENCE RECORD:
Company: ${reportContext?.companyName || 'Target Startup'}
Sector: ${reportContext?.sector || 'Technology'}
Stage: ${reportContext?.stage || 'Series A'}
Investment Signal: ${reportContext?.signal?.badgeLabel || reportContext?.signal?.signal || 'N/A'}
Conviction Score: ${reportContext?.signal?.convictionScore || 'N/A'}/100
Partner Directive: ${reportContext?.signal?.partnerDirective || 'N/A'}
Financial Baseline:
- ARR: $${reportContext?.baseline?.arr ?? 'N/A'}M
- Monthly Burn: $${reportContext?.baseline?.monthlyBurn ?? 'N/A'}M
- Cash Runway: ${reportContext?.baseline?.runwayMonths ?? 'N/A'} months
- Gross Margin: ${reportContext?.baseline?.grossMarginPct ?? 'N/A'}%
- Target Raise: $${reportContext?.baseline?.targetRaise ?? reportContext?.targetRaise ?? 'N/A'}M
- Claimed Valuation: $${reportContext?.baseline?.valuationClaim ?? reportContext?.valuationClaim ?? 'N/A'}M
Forensic Red Flags: ${reportContext?.forensicGaps?.map((g: any) => g.title).join('; ') || 'None logged'}

PARTNER INTERROGATORY / QUERY:
"${query}"

INSTRUCTIONS:
- Deliver an unvarnished, mathematically rigorous response grounded in the target's diligence data.
- If drafting founder communications, generate a firm, authentic partner email demanding data room access, unblended cohort curves, and cap table disclosure.
- If simulating downside, stress test runway, cash burn, and required valuation haircuts with exact numbers.
- If drafting an IC Memo, synthesize Thesis, Metrics & Valuation, Critical Red Flags, and Deal Terms.
- Use clear Markdown formatting with bullet points and bold financial figures.`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        console.log(`[VCDiligenceAgent:Copilot] Formulating advisory answer using ${model}...`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        });
        if (response.text) return response.text;
      } catch (err: any) {
        console.log(`[VCDiligenceAgent:Copilot] Note on model ${model}:`, err?.status || err?.code || 'call failed');
        lastError = err;
      }
    }

    const statusCode = extractGeminiStatusCode(lastError);
    throw new GeminiApiError(statusCode);
  }

  public synthesizeInstitutionalCopilotAnswer(query: string, reportContext: any, noticeDepleted = false): string {
    const company = reportContext?.companyName || 'Target Startup';
    const sector = reportContext?.sector || 'General SaaS';
    const stage = reportContext?.stage || 'Series A';
    const baseline = reportContext?.baseline || {};
    const arr = typeof baseline.arr === 'number' ? baseline.arr : 2.5;
    const monthlyBurn = typeof baseline.monthlyBurn === 'number' ? baseline.monthlyBurn : 0.22;
    const burnK = Math.round(monthlyBurn * 1000);
    const runwayMonths = typeof baseline.runwayMonths === 'number' ? baseline.runwayMonths : 12;
    const grossMargin = typeof baseline.grossMarginPct === 'number' ? baseline.grossMarginPct : 72;
    const targetRaise = typeof baseline.targetRaise === 'number' ? baseline.targetRaise : (reportContext?.targetRaise || 5.0);
    const valuation = typeof baseline.valuationClaim === 'number' ? baseline.valuationClaim : (reportContext?.valuationClaim || 25.0);
    const signal = reportContext?.signal || {};
    const convictionScore = typeof signal.convictionScore === 'number' ? signal.convictionScore : 68;
    const badgeLabel = signal.badgeLabel || signal.signal || '🟡 CONDITIONAL // DEEP DATA ROOM AUDIT';
    const partnerDirective = signal.partnerDirective || 'Require full unblended cohort disclosure and customer contract validation.';
    const verdictSummary = signal.verdictSummary || 'Underwriting assessment completed across core diligence vectors.';
    const forensicGaps = Array.isArray(reportContext?.forensicGaps) ? reportContext.forensicGaps : [];

    const lower = (query || '').toLowerCase();
    let responseBody = '';

    if (lower.includes('email') || lower.includes('hardball') || lower.includes('interrogat') || lower.includes('founder') || lower.includes('draft email')) {
      responseBody = `### Institutional Hardball Interrogation: ${company}

**To:** Founders & Executive Team, ${company}  
**From:** Investment Committee / Lead Deal Partner  
**Subject:** Diligence Data Room & Audit Verification — ${stage} Financing Round  

Dear ${company} Team,

Thank you for presenting your ${stage} materials. While our Investment Committee recognizes the operational momentum demonstrated in your overview, our institutional underwriting mandate requires forensic verification of key unit economics prior to advancing to a binding term sheet.

Our initial underwriting reflects a contracted ARR baseline of **$${arr}M**, current monthly net burn of **$${monthlyBurn}M** (~**$${burnK}k/mo**), and a cash runway of **${runwayMonths} months** against a target raise of **$${targetRaise}M** at an implied **$${valuation}M** valuation claim.

To finalize our investment committee review, we require the following data room uploads within 4 business days:

1. **Unblended Cohort Retention Data (M0–M24)**  
   Provide raw logo and net revenue retention tables broken down by customer acquisition channel (organic vs paid performance marketing) and customer segment. Blended averages across mixed cohorts are inadmissible for IC approval.

2. **Full CAC Reconciliation & Sales Spend Ledger**  
   Submit a complete monthly ledger reconciliation of all Sales & Marketing expenditures—including all performance advertising, outsourced agency retainers, and fully loaded headcounts—alongside unblended CAC payback calculations.

3. **Customer Concentration & Contract Terms**  
   Provide signed master service agreements (MSAs), annual contract values (ACVs), renewal dates, and early termination clauses for your top-5 revenue contributors.

4. **Pro-Forma Capitalization Table & Dilution Schedule**  
   Provide the full share register reflecting all outstanding SAFEs, convertible debt notes, unallocated employee option pools (post-financing), and liquidation preference tiers.

5. **Bank Verification & Trailing 12-Month Audited P&L**  
   Provide authenticated bank account statements verifying current cash on hand, alongside monthly audited financial statements.

We appreciate your swift turnaround as we prepare our final committee memorandum.

Best regards,  
**Pitch Black Investment Committee**`;
    } else if (lower.includes('memo') || lower.includes('ic memo') || lower.includes('investment committee') || lower.includes('thesis')) {
      const impliedMultiple = arr > 0 ? (valuation / arr).toFixed(1) : '10.0';
      responseBody = `# INVESTMENT COMMITTEE MEMORANDUM (STRICTLY CONFIDENTIAL)

**Target Company:** ${company}  
**Sector / Category:** ${sector} | **Stage:** ${stage}  
**Target Capital Raise:** $${targetRaise}M | **Claimed Post-Money Valuation:** $${valuation}M (${impliedMultiple}x ARR)  
**Conviction Score:** ${convictionScore}/100 | **Verdict:** ${badgeLabel}  
**Lead Partner Directive:** ${partnerDirective}  

---

### 1. Executive Thesis & Deal Framing
${company} is operating within the ${sector} vertical, presenting **$${arr}M in ARR** supported by **${runwayMonths} months** of remaining operational runway. The core product addresses high-priority workflow requirements; however, our underwriting committee flags execution friction regarding sustainable customer acquisition payback and customer concentration.

### 2. Underwriting Metrics & Benchmark Performance
* **Contracted ARR:** $${arr}M (Burn: $${burnK}k/month)
* **Cash Runway:** ${runwayMonths} months remaining
* **Reported Gross Margin:** ${grossMargin}%
* **Capital Ask vs Valuation:** $${targetRaise}M raise on $${valuation}M claimed post-money
* **Burn Multiple Assessment:** Sustainable only if net new ARR velocity accelerates by >25% post-funding.

### 3. Forensic Diligence Gaps & Key Vulnerabilities
${forensicGaps.length > 0 ? forensicGaps.slice(0, 3).map((g: any, i: number) => `${i + 1}. **${g.title}**: ${g.concealedReality || g.surfaceClaim || 'Verification required'} *(Financial Impact: ${g.financialImpact || 'High'})*`).join('\n') : `1. **Cohort Decay Cliffs**: Verification required on M12–M18 revenue retention across non-enterprise cohorts.\n2. **Sales Efficiency**: True loaded CAC payback must be audited against organic referral claims.\n3. **Option Pool Replenishment**: Cap table requires post-money ESOP expansion to at least 12%.`}

### 4. Structuring Terms & Governance Covenants
* **Tranche Milestone Gating:** Release first 50% ($${(targetRaise * 0.5).toFixed(1)}M) at signing; tie remainder to hitting verified ARR thresholds.
* **Valuation Discipline:** Counter at market-disciplined multiple to safeguard downside equity buffer.
* **Board Governance:** Demand 1 Lead Investor Board Seat with standard protective provisions.

### 5. Final Recommendation
**${badgeLabel}**  
*${verdictSummary}*`;
    } else if (lower.includes('moat') || lower.includes('defensib') || lower.includes('sequoia') || lower.includes('crucible')) {
      responseBody = `### Sequoia Crucible Moat & Defensibility Audit: ${company}

**Target Startup:** ${company} | **Sector:** ${sector} | **Conviction Score:** ${convictionScore}/100

---

#### 1. Foundation Model Commoditization Risk
* **Assessment:** High exposure if technical differentiation relies solely on prompt chains or basic API integrations.
* **Vulnerability:** Any workflow features reproducible by frontier models within 6–12 months face zero-margin pricing pressure.
* **Audit Mandate:** Verify proprietary vertical fine-tuning and domain-specific dataset ownership that third-party foundation models cannot replicate.

#### 2. Workflow Stickiness & System of Record Lock-In
* **Embedding Depth:** Audit whether ${company} acts as the primary system of record or merely a client-side wrapper.
* **Switching Friction:** At a ${grossMargin}% gross margin, non-essential enterprise tools encounter high churn during annual budget reviews.

#### 3. Data Network Effects & Compounding Advantages
* **Defensibility Flywheel:** Mandate verification on whether incremental customer usage compounds platform accuracy and creates high barriers to competitor entry.

#### 4. Crucible Underwriting Verdict
* **Mandated Action:** Conduct blind customer reference calls with 3 churned accounts before issuing term sheet terms to stress-test true indispensability.`;
    } else if (lower.includes('downturn') || lower.includes('stress') || lower.includes('recession') || lower.includes('haircut') || lower.includes('downside')) {
      const reducedValuation = (valuation * 0.5).toFixed(1);
      const dilutionPct = Math.round((targetRaise / (valuation * 0.5)) * 100);
      const contractedRunway = Math.max(4, Math.round(runwayMonths * 0.65));
      const targetBurn = (monthlyBurn * 0.65).toFixed(2);

      responseBody = `### 2023 Downturn Stress Test & Downside Sensitivity: ${company}

**Baseline Underwriting:** $${arr}M ARR | $${monthlyBurn}M/mo Burn | ${runwayMonths} Mo Runway | $${valuation}M Valuation

---

#### 1. 50% Valuation Multiple Compression
* **Valuation Impact:** In a defensive macro environment, multiple contraction resets ${company}'s achievable post-money valuation to approximately **$${reducedValuation}M**.
* **Founder Dilution:** Raising the full $${targetRaise}M target at this compressed multiple would result in founders accepting **${dilutionPct}%** dilution.

#### 2. 2x Enterprise Sales Cycle Elongation
* **Velocity Drag:** Enterprise procurement cycles expanding from 60 to 120+ days halves Net New ARR velocity.
* **Burn Multiple Inflation:** Net burn multiple expands above 2.5x unless sales and marketing expenses are restructured.

#### 3. Churn Escalation & Runway Contraction
* **Runway Contraction:** Under a 20% increase in logo churn, existing cash reserves contract safe operational runway from **${runwayMonths} months** down to **${contractedRunway} months**.

#### 4. Capital Preservation Playbook
* **Expense Restructuring:** Immediately decrease monthly net burn from $${monthlyBurn}M down to **$${targetBurn}M/month** to guarantee a minimum 18-month self-sufficiency cushion without external bridge financing.`;
    } else {
      responseBody = `### Diligence Partner Advisory: ${company}

**Interrogatory:** "${query}"  
**Target Startup:** ${company} (${sector} — ${stage})  
**Investment Signal:** ${badgeLabel} (${convictionScore}/100)  

---

#### 1. Quantitative Baseline Underwriting
* **Contracted ARR:** $${arr}M
* **Monthly Net Burn:** $${monthlyBurn}M (~$${burnK}k/mo)
* **Operating Runway:** ${runwayMonths} months remaining
* **Reported Gross Margin:** ${grossMargin}%
* **Capital Ask & Valuation:** $${targetRaise}M at $${valuation}M valuation claim

#### 2. Lead Partner Directive & Guidance
${partnerDirective}

#### 3. Core Underwriting Verdict
${verdictSummary}

${forensicGaps.length > 0 ? `#### 4. Active Forensic Flags to Monitor\n${forensicGaps.slice(0, 2).map((g: any) => `* **${g.title}**: ${g.remediationAction || g.concealedReality || 'Verification required.'}`).join('\n')}` : ''}`;
    }

    if (noticeDepleted) {
      responseBody += `\n\n---\n*💡 **Institutional Engine Note**: Advisory analysis generated via Pitch Black Local Diligence Engine (Gemini API prepayment credits depleted). To re-enable live Gemini Flash generative calls, top up credits at [Google AI Studio](https://ai.studio/projects).*`;
    }

    return responseBody;
  }

  private normalizeReport(parsed: any, companyName: string, sector: string, stage: string): FullDiligenceReport {
    if (!parsed || typeof parsed !== 'object') return parsed;

    if (!parsed.companyName) parsed.companyName = companyName || 'Target Startup';
    if (!parsed.sector) parsed.sector = sector || 'GENERAL_SAAS';
    if (!parsed.stage) parsed.stage = stage || 'Series A';

    if (!parsed.signal) parsed.signal = {};
    if (!parsed.signal.signal) parsed.signal.signal = 'CONDITIONAL';
    if (typeof parsed.signal.convictionScore !== 'number') parsed.signal.convictionScore = 75;
    if (!parsed.signal.badgeLabel) {
      parsed.signal.badgeLabel = parsed.signal.convictionScore >= 80
        ? '🟢 HIGH CONVICTION // PROCEED TO PARTNER MEETING'
        : parsed.signal.convictionScore >= 60
        ? '🟡 CONDITIONAL // DEEP DATA ROOM AUDIT'
        : '🔴 PASS / REJECT // CONCERNS FLAGGED';
    }
    if (!parsed.signal.partnerDirective) parsed.signal.partnerDirective = 'Proceed with structured due diligence and verify unit economics.';
    if (!parsed.signal.verdictSummary) parsed.signal.verdictSummary = 'Underwriting assessment completed across core vectors.';
    if (!parsed.signal.bullCase) parsed.signal.bullCase = 'Rapid market share capture with expansion across enterprise tiers.';
    if (!parsed.signal.baseCase) parsed.signal.baseCase = 'Consistent ARR growth and sustainable logo retention.';
    if (!parsed.signal.bearCase) parsed.signal.bearCase = 'Growth deceleration and margin compression under competitive headwinds.';

    const sc = parsed.signal.scorecard || {};
    parsed.signal.scorecard = {
      founderTeam: {
        score: typeof sc.founderTeam?.score === 'number' ? sc.founderTeam.score : (typeof sc.founderTeam === 'number' ? sc.founderTeam : 7.8),
        max: sc.founderTeam?.max || 10,
        title: sc.founderTeam?.title || 'Founder Team & Execution Cadence',
        notes: sc.founderTeam?.notes || 'Demonstrates domain velocity; executive GTM hires required.'
      },
      marketTam: {
        score: typeof sc.marketTam?.score === 'number' ? sc.marketTam.score : (typeof sc.marketTam === 'number' ? sc.marketTam : 8.2),
        max: sc.marketTam?.max || 10,
        title: sc.marketTam?.title || 'Market TAM & Secular Tailwinds',
        notes: sc.marketTam?.notes || 'Operating in high-velocity category with expansion potential.'
      },
      productMoat: {
        score: typeof sc.productMoat?.score === 'number' ? sc.productMoat.score : (typeof sc.productMoat === 'number' ? sc.productMoat : 6.5),
        max: sc.productMoat?.max || 10,
        title: sc.productMoat?.title || 'Product Defensibility & Switching Costs',
        notes: sc.productMoat?.notes || 'High API embed stickiness; audit data ownership clauses.'
      },
      unitEconomics: {
        score: typeof sc.unitEconomics?.score === 'number' ? sc.unitEconomics.score : (typeof sc.unitEconomics === 'number' ? sc.unitEconomics : 6.0),
        max: sc.unitEconomics?.max || 10,
        title: sc.unitEconomics?.title || 'Unit Economics & Margin Rigor',
        notes: sc.unitEconomics?.notes || 'Gross margins and customer acquisition payback monitored closely.'
      },
      diligenceRisk: {
        score: typeof sc.diligenceRisk?.score === 'number' ? sc.diligenceRisk.score : (typeof sc.diligenceRisk === 'number' ? sc.diligenceRisk : 5.5),
        max: sc.diligenceRisk?.max || 10,
        title: sc.diligenceRisk?.title || 'Forensic Diligence & Cap Table Risk',
        notes: sc.diligenceRisk?.notes || 'Runway governance and capital allocation discipline required.'
      }
    };

    if (!parsed.baseline) parsed.baseline = {};
    if (typeof parsed.baseline.arr !== 'number') parsed.baseline.arr = 2.4;
    if (typeof parsed.baseline.cashOnHand !== 'number') parsed.baseline.cashOnHand = 3.2;
    if (typeof parsed.baseline.monthlyBurn !== 'number') parsed.baseline.monthlyBurn = 0.18;
    if (typeof parsed.baseline.runwayMonths !== 'number') parsed.baseline.runwayMonths = 18;
    if (typeof parsed.baseline.grossMarginPct !== 'number') parsed.baseline.grossMarginPct = 78;
    if (typeof parsed.baseline.blendedCac !== 'number') parsed.baseline.blendedCac = 4500;
    if (typeof parsed.baseline.salesCycleDays !== 'number') parsed.baseline.salesCycleDays = 60;
    if (typeof parsed.baseline.targetRaise !== 'number') parsed.baseline.targetRaise = 5.0;
    if (typeof parsed.baseline.valuationClaim !== 'number') parsed.baseline.valuationClaim = 25;

    if (!Array.isArray(parsed.metrics)) parsed.metrics = [];
    if (!Array.isArray(parsed.forensicGaps)) parsed.forensicGaps = [];
    if (!Array.isArray(parsed.questionBank)) parsed.questionBank = [];
    if (!Array.isArray(parsed.cohortDecay)) parsed.cohortDecay = [];
    if (!Array.isArray(parsed.historicalQuarters)) parsed.historicalQuarters = [];

    if (!parsed.subsectorAudit || typeof parsed.subsectorAudit !== 'object') {
      parsed.subsectorAudit = {
        sector: parsed.sector || 'GENERAL_SAAS',
        sectorName: 'General SaaS Diligence Lens',
        overview: 'Specialized unit economic verification and recurring revenue expansion audit.',
        checks: [
          {
            pillar: 'Sales Efficiency & Magic Number',
            status: 'PASS',
            metricValue: '0.82x',
            targetBenchmark: '> 0.75x',
            finding: 'Efficient ARR generation per dollar of sales & marketing.',
            institutionalRisk: 'Requires expansion validation as outbound sales scales.'
          },
          {
            pillar: 'Net Dollar Retention & Expansion',
            status: 'FLAG',
            metricValue: '112%',
            targetBenchmark: '> 120%',
            finding: 'Expansion healthy but trailing top-decile enterprise peers.',
            institutionalRisk: 'Net retention churn risk in mid-market tier.'
          },
          {
            pillar: 'Gross Margin & Infrastructure COGS',
            status: 'PASS',
            metricValue: '78%',
            targetBenchmark: '75-85%',
            finding: 'Strong software margins with controlled cloud computing overhead.',
            institutionalRisk: 'Audit multi-cloud migration commitments.'
          },
          {
            pillar: 'Enterprise Security & Compliance',
            status: 'PASS',
            metricValue: 'SOC2 Type II',
            targetBenchmark: 'SOC2 Type II Certified',
            finding: 'Enterprise readiness standard met for procurement cycles.',
            institutionalRisk: 'Periodic renewal audit required.'
          }
        ]
      };
    }

    return parsed as FullDiligenceReport;
  }

  public async evaluateGrounding(pitchText: string, report: FullDiligenceReport): Promise<GroundingEvaluationReport> {
    const ai = this.getGeminiClient();
    if (!ai) {
      throw new GeminiApiError(400);
    }

    const prompt = `You are the Lead Forensic Grounding and Hallucination Auditor at Pitch Black VC.
Audit all 9 pillars of the Generated Diligence Report against the Raw Uploaded Pitch Text.

CRITICAL DISTINCTION IN YOUR EVALUATION:
1. MATHEMATICAL FORMULAS & FUNCTIONS: COMPLETELY VALID. If data was derived via mathematical calculations (e.g., Runway = Cash / Monthly Burn, Implied Multiple = Valuation / ARR, Rule of 40 = Growth + Margin, or scenario multiples), that is legitimate financial modeling and is ACCEPTABLE. Tag as "MATHEMATICAL_CALCULATION" and specify the formula.
2. DIRECT PITCH SOURCE: Data explicitly cited in uploaded pitch text. Tag as "DIRECT_PITCH_SOURCE" and provide exact quotation.
3. PURELY SYNTHESIZED OUT OF NOWHERE: STRICTLY INFORM THE USER. If any information (such as Founder & Team pedigree, specific client logos, or compliance certs) is NOT in the pitch and CANNOT be calculated with a mathematical formula, you MUST record it in "purelySynthesizedItems" and tag as "PURE_SYNTHESIS_ALERT".

=== RAW UPLOADED PITCH TEXT ===
${pitchText || 'No raw pitch text provided.'}

=== GENERATED DILIGENCE REPORT (9 PILLARS) ===
Company: ${report.companyName}
Stage & Sector: ${report.stage} - ${report.sector}
Baseline ARR: $${report.baseline?.arr || 0}M
Target Raise Ask: $${report.baseline?.targetRaise || 0}M
Valuation Claim: $${report.baseline?.valuationClaim || 0}M
Monthly Burn: $${(report.baseline?.monthlyBurn || 0) * 1000}k | Runway: ${report.baseline?.runwayMonths || 0} months
Gross Margin: ${report.baseline?.grossMarginPct || 0}%
Verdict Summary: ${report.signal?.verdictSummary || ''}
Scorecard Team Assessment: ${report.signal?.scorecard?.founderTeam?.score || 0}/${report.signal?.scorecard?.founderTeam?.max || 20} (Notes: ${report.signal?.scorecard?.founderTeam?.notes || 'N/A'})
Historical Quarters: ${(report.historicalQuarters || []).map((q) => `${q.quarter}: $${q.arr}M`).join(', ')}
Forensic Gaps: ${(report.forensicGaps || []).map((g) => g.title).join(', ')}

Return ONLY a valid JSON object matching this schema:
{
  "score": 8.8,
  "grade": "A" | "A+" | "B+" | "B" | "C" | "D",
  "hallucinationRisk": "VERY_LOW" | "LOW" | "MODERATE" | "HIGH",
  "evaluationSummary": "Concise, crisp summary explaining score out of 10. Explicitly state whether formulas are valid and call out any purely synthesized data (e.g. Founder/Team).",
  "sourceWordCount": 240,
  "purelySynthesizedCount": 1,
  "mathematicalDerivationsCount": 4,
  "groundedSourceCount": 4,
  "purelySynthesizedItems": [
    {
      "id": "synth-team",
      "pillar": "Pillar 02: 5-Factor Scorecard",
      "pillarId": 2,
      "item": "Founder & Executive Pedigree",
      "claimInReport": "Founder capabilities & background notes",
      "whySynthesized": "No founder or team data in uploaded pitch text, and cannot be derived from a mathematical formula.",
      "investorAlert": "Must obtain founder bios before underwriting team conviction.",
      "severity": "CRITICAL"
    }
  ],
  "ledgerItems": [
    {
      "id": "arr-item",
      "category": "Revenue & Scale",
      "pillar": "Pillar 04: Quantitative Metrics",
      "pillarId": 4,
      "item": "Contracted ARR",
      "type": "DIRECT_PITCH_SOURCE",
      "sourceValue": "$3.2M in pitch",
      "reportValue": "$3.2M ARR",
      "formulaOrCitation": "ARR: $3,200,000",
      "explanation": "Directly grounded in pitch disclosures"
    },
    {
      "id": "runway-item",
      "category": "Cash & Runway",
      "pillar": "Pillar 08: Sensitivity Copilot",
      "pillarId": 8,
      "item": "Cash Runway Months",
      "type": "MATHEMATICAL_CALCULATION",
      "sourceValue": "Cash ($2.1M) / Monthly Burn ($245k)",
      "reportValue": "8.6 Months",
      "formulaOrCitation": "Formula: Cash ÷ Monthly Burn",
      "explanation": "Mathematically calculated from cash and burn"
    }
  ]
}`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[evaluateGrounding] Auditing grounding with model ${model}...`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.1,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        return {
          ...parsed,
          evaluatedAt: new Date().toISOString(),
          evaluationMethod: 'AI_DEEP_EVALUATION',
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[evaluateGrounding] Model ${model} error:`, err?.message || err);
      }
    }

    throw lastError || new GeminiApiError(500);
  }
}

export const vcDiligenceAgent = new VCDiligenceAgent();
