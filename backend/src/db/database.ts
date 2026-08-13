import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const databaseFile =
  process.env.NODE_ENV === "test"
    ? "taskflow.test.db"
    : "taskflow.db";

const databasePath = path.join(
  dataDirectory,
  databaseFile
);

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

const schemaPath = path.join(
  process.cwd(),
  "src",
  "db",
  "schema.sql"
);

const schema = fs.readFileSync(
  schemaPath,
  "utf-8"
);

db.exec(schema);

export default db;