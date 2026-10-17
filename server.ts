import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import helmet from "helmet";

// Modular routers
import { authRouter } from "./server/routes/auth.routes.ts";
import { auditRouter } from "./server/routes/audit.routes.ts";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Trust first proxy hop (Cloud Run / AI Studio reverse proxy) for accurate client IP in rate limiting
  app.set("trust proxy", 1);

  // Mount Helmet security headers
  // Configured to maintain full compatibility with AI Studio iframe preview and Vite scripts
  app.use(
    helmet({
      contentSecurityPolicy: false, // Prevents interfering with Vite inline scripts and external fonts/assets
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false, // Critical: Allows Google OAuth popup window.opener postMessage callback
      crossOriginResourcePolicy: { policy: "cross-origin" },
      frameguard: false, // Crucial: Allows embedding in AI Studio workspace preview iframe
    })
  );

  // Keep standard JSON payloads small (1MB) to prevent memory exhaustion and DoS attacks,
  // applying large limits strictly to dedicated file upload streams.
  const uploadJsonParser = express.json({ limit: "50mb" });
  const standardJsonParser = express.json({ limit: "1mb" });

  app.use((req, res, next) => {
    // Dedicated file upload routes only
    if (req.path.startsWith("/api/upload")) {
      return uploadJsonParser(req, res, next);
    }
    return standardJsonParser(req, res, next);
  });

  // Handle payload too large errors cleanly with a 413 JSON response
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && (err.type === "entity.too.large" || err.status === 413)) {
      return res.status(413).json({
        error: "Payload Too Large",
        message: "Request body exceeds the maximum allowed limit (1MB for standard endpoints, 50MB for file upload routes).",
      });
    }
    next(err);
  });

  // Mount Modular Routes
  app.use("/api/auth", authRouter);
  app.use("/api", auditRouter);

  // Serve Frontend
  const distPath = path.join(process.cwd(), "dist");
  const indexHtmlExists = fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV !== "production" || !indexHtmlExists) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown handling for Cloud Run & container orchestration
  const gracefulShutdown = (signal: string) => {
    console.log(`[SERVER] ${signal} received. Closing server gracefully...`);
    server.close(() => {
      console.log("[SERVER] HTTP server closed cleanly.");
      process.exit(0);
    });

    // Force close if outstanding requests hang beyond 10s
    setTimeout(() => {
      console.error("[SERVER] Force shutting down after graceful exit timeout.");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

// Global process error safety handlers to prevent abrupt unlogged termination
process.on("unhandledRejection", (reason: unknown) => {
  console.error("[FATAL] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("[FATAL] Uncaught Exception:", error);
});

startServer();
