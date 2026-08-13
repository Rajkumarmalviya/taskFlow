import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import { config } from "../config/index.js";

// ─── Ensure data directory exists ────────────────────────────────────────────

if (!fs.existsSync(config.db.dir)) {
  fs.mkdirSync(config.db.dir, { recursive: true });
}

// ─── Open database ────────────────────────────────────────────────────────────

const db = new Database(config.db.path);

// ─── PRAGMAs ─────────────────────────────────────────────────────────────────

// WAL mode: concurrent reads + better crash safety
db.pragma("journal_mode = WAL");
// Enforce foreign-key constraints at the SQLite level
db.pragma("foreign_keys = ON");
// Synchronous mode aligned to WAL for reliability without sacrificing too much speed
db.pragma("synchronous = NORMAL");

// ─── Schema initialisation ───────────────────────────────────────────────────

const schemaPath = path.join(process.cwd(), "src", "db", "schema.sql");

try {
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
} catch (err) {
  console.error("[database] Failed to apply schema:", err);
  process.exit(1);
}

export default db;
