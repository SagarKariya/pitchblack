import { Router } from "express";
import {
  generateAuditWithGemini,
  generateCopilotAnswer,
  evaluateGroundingWithGemini,
  extractGeminiStatusCode,
} from "../lib/geminiAudit.ts";
import { requireApprovedUserAuth } from "../middleware/auth.ts";
import { aiAnalysisLimiter, copilotLimiter } from "../middleware/rateLimiters.ts";

const router = Router();

const ALLOWED_SECTORS = new Set([
  "ENTERPRISE_AI",
  "FINTECH",
  "HEALTHTECH",
  "IOT_HAAS",
  "GENERAL_SAAS",
]);

const ALLOWED_STAGES = new Set([
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D+",
  "Growth",
]);

// Full Pitch Diligence Audit generation endpoint
router.post("/pitch-audit", requireApprovedUserAuth, aiAnalysisLimiter, async (req, res) => {
  try {
    const { pitchText, sector, companyName, stage } = req.body;

    // 1. Boundary check: pitchText (string, 100 <= length <= 60,000 characters)
    if (typeof pitchText !== "string") {
      return res.status(400).json({
        error: "Missing or invalid pitchText: Must be a non-empty string.",
      });
    }

    const trimmedPitch = pitchText.trim();
    if (trimmedPitch.length < 100 || trimmedPitch.length > 60000) {
      return res.status(400).json({
        error: `pitchText bounds violation: length must be between 100 and 60,000 characters (received ${trimmedPitch.length} characters).`,
      });
    }

    // 2. Boundary check: companyName (optional string, max 150 characters)
    let sanitizedCompanyName: string | undefined = undefined;
    if (companyName !== undefined && companyName !== null && companyName !== "") {
      if (typeof companyName !== "string") {
        return res.status(400).json({
          error: "Invalid companyName: Must be a string.",
        });
      }
      sanitizedCompanyName = companyName.trim();
      if (sanitizedCompanyName.length > 150) {
        return res.status(400).json({
          error: `companyName bounds violation: exceeds maximum allowed length of 150 characters (received ${sanitizedCompanyName.length} characters).`,
        });
      }
    }

    // 3. Boundary check: sector (optional string, allowlisted enum or max 60 characters)
    let sanitizedSector: string | undefined = undefined;
    if (sector !== undefined && sector !== null && sector !== "") {
      if (typeof sector !== "string") {
        return res.status(400).json({
          error: "Invalid sector: Must be a string.",
        });
      }
      sanitizedSector = sector.trim();
      if (!ALLOWED_SECTORS.has(sanitizedSector) && sanitizedSector.length > 60) {
        return res.status(400).json({
          error: `sector bounds violation: must be an allowlisted sector or descriptor up to 60 characters (received ${sanitizedSector.length} characters).`,
        });
      }
    }

    // 4. Boundary check: stage (optional string, allowlisted enum or max 40 characters)
    let sanitizedStage: string | undefined = undefined;
    if (stage !== undefined && stage !== null && stage !== "") {
      if (typeof stage !== "string") {
        return res.status(400).json({
          error: "Invalid stage: Must be a string.",
        });
      }
      sanitizedStage = stage.trim();
      if (!ALLOWED_STAGES.has(sanitizedStage) && sanitizedStage.length > 40) {
        return res.status(400).json({
          error: `stage bounds violation: must be an allowlisted stage or descriptor up to 40 characters (received ${sanitizedStage.length} characters).`,
        });
      }
    }

    console.log(
      `[pitch-audit] Running audit for ${sanitizedCompanyName || "Target Startup"} (${sanitizedSector || "General"} - ${sanitizedStage || "Series A"}), pitch length: ${trimmedPitch.length}...`
    );
    const report = await generateAuditWithGemini(
      trimmedPitch,
      sanitizedSector,
      sanitizedCompanyName,
      sanitizedStage
    );
    return res.json({ success: true, report });
  } catch (err: unknown) {
    const statusCode = extractGeminiStatusCode(err);
    return res.status(statusCode).json({
      success: false,
      geminiIssue: true,
      statusCode,
      error: `Gemini API issue(${statusCode})`,
    });
  }
});

// Copilot interactive queries (supports both /pitch-copilot and /copilot/chat)
router.post(["/pitch-copilot", "/copilot/chat"], requireApprovedUserAuth, copilotLimiter, async (req, res) => {
  try {
    const { query, reportContext } = req.body;
    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Missing or invalid query: Must be a non-empty string." });
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 4000) {
      return res.status(400).json({
        error: `Query bounds violation: exceeds maximum allowed limit of 4,000 characters (received ${trimmedQuery.length} characters).`,
      });
    }

    console.log(`[pitch-copilot] Answering partner query: "${trimmedQuery.substring(0, 80)}..."`);
    const answer = await generateCopilotAnswer(trimmedQuery, reportContext);
    return res.json({ success: true, answer });
  } catch (err: unknown) {
    const statusCode = extractGeminiStatusCode(err);
    return res.status(statusCode).json({
      success: false,
      geminiIssue: true,
      statusCode,
      error: `Gemini API issue(${statusCode})`,
    });
  }
});

// Grounding & Hallucination verification endpoint
router.post("/grounding-audit", requireApprovedUserAuth, aiAnalysisLimiter, async (req, res) => {
  try {
    const { pitchText, report } = req.body;
    if (!report || typeof report !== "object") {
      return res.status(400).json({ error: "Missing or invalid report payload." });
    }

    console.log(
      `[grounding-audit] Auditing grounding fidelity for "${report.companyName || 'Target Company'}" (Pitch chars: ${(pitchText || '').length})...`
    );
    const evaluation = await evaluateGroundingWithGemini(pitchText || '', report);
    return res.json({ success: true, report: evaluation });
  } catch (err: unknown) {
    const statusCode = extractGeminiStatusCode(err);
    return res.status(statusCode).json({
      success: false,
      geminiIssue: true,
      statusCode,
      error: `Gemini API issue(${statusCode})`,
    });
  }
});

export const auditRouter = router;
