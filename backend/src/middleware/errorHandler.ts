import { Request, Response, NextFunction } from "express";

// ─── AppError ─────────────────────────────────────────────────────────────────

/**
 * Operational error with an HTTP status code.
 * Throw this anywhere in controllers / services to get a structured response.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    // Preserve the prototype chain when compiling to ES5
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Global error-handling middleware ────────────────────────────────────────

/**
 * Must be registered last (after all routes) in server.ts.
 * Express recognises a four-argument function as an error handler.
 */
export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Operational errors we raised ourselves
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unexpected / programming errors — never leak internals in production
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd && err instanceof Error) {
    console.error("[Unhandled error]", err);
    res.status(500).json({ error: err.message });
    return;
  }

  console.error("[Unhandled error]", err);
  res.status(500).json({ error: "Internal server error" });
}

// ─── 404 catcher ─────────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route ${req.method} ${req.path} not found`, 404));
}
