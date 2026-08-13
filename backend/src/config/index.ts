import path from "path";
import dotenv from "dotenv";

// Load .env before anything else reads process.env
dotenv.config();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined) return fallback;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable "${key}" must be an integer, got: "${raw}"`);
  }
  return parsed;
}

// ─── Config object ────────────────────────────────────────────────────────────

const NODE_ENV = getEnv("NODE_ENV", "development");

const dbFile =
  NODE_ENV === "test" ? "taskflow.test.db" : getEnv("DB_FILE", "taskflow.db");

export const config = {
  port: getEnvInt("PORT", 5000),
  nodeEnv: NODE_ENV,
  isProduction: NODE_ENV === "production",
  isTest: NODE_ENV === "test",

  /** Allowed CORS origin. Use '*' only in development. */
  corsOrigin: getEnv("CORS_ORIGIN", "*"),

  /** Maximum accepted JSON body size (express.json limit). */
  jsonBodyLimit: getEnv("JSON_BODY_LIMIT", "50kb"),

  db: {
    /** Absolute path to the SQLite database file */
    path: path.join(process.cwd(), "data", dbFile),
    /** Directory that contains the database files */
    dir: path.join(process.cwd(), "data"),
  },
} as const;
