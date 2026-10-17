import rateLimit from "express-rate-limit";

// Strict rate limiters for cost-heavy AI operations, copilot reasoning, and email dispatches
export const aiAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 analysis calls per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI analysis requests from this IP. Rate limit is 10 requests per 15 minutes. Please try again later.",
    retryAfterMinutes: 15,
  },
});

export const copilotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 partner copilot queries per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many copilot queries from this IP. Rate limit is 30 queries per 15 minutes.",
    retryAfterMinutes: 15,
  },
});

export const authEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 auth/email requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication or notification requests from this IP. Rate limit is 15 requests per 15 minutes.",
    retryAfterMinutes: 15,
  },
});
