import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import { config } from "./config/index.js";
import { globalErrorHandler, notFoundHandler, AppError } from "./middleware/errorHandler.js";

// Initialise DB before routes so schema is applied on startup
import "./db/database.js";

import boardRoutes from "./routes/boardRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// ─── App factory ─────────────────────────────────────────────────────────────

export function createApp() {
  const app = express();

  // ── CORS ─────────────────────────────────────────────────────────────────
  // Set CORS_ORIGIN=https://yourfrontend.com in production.
  // Defaults to '*' in development only.
  app.use(cors({ origin: config.corsOrigin }));

  // ── JSON body parsing with size cap ──────────────────────────────────────
  app.use(express.json({ limit: config.jsonBodyLimit }));

  // ── Malformed JSON → structured 400 ──────────────────────────────────────
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (
      typeof err === "object" &&
      err !== null &&
      "type" in err &&
      (err as { type: string }).type === "entity.parse.failed"
    ) {
      res.status(400).json({ error: "Malformed JSON in request body" });
      return;
    }
    next(err);
  });

  // ── Health check ─────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: config.nodeEnv });
  });

  // ── Routes ───────────────────────────────────────────────────────────────
  app.use("/api/boards", boardRoutes);
  app.use("/api/tasks", taskRoutes);

  // ── 404 → error pipeline ─────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ── Global error handler (must be last) ──────────────────────────────────
  app.use(globalErrorHandler);

  return app;
}

// ─── Startup ─────────────────────────────────────────────────────────────────

// Only listen when this file is the entry point, not when imported by tests
if (process.env.NODE_ENV !== "test") {
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[server] Running on http://localhost:${config.port} (${config.nodeEnv})`);
  });
}
