import fs from "fs";
import path from "path";

const testDatabasePath = path.join(
  process.cwd(),
  "data",
  "taskflow.test.db"
);

if (fs.existsSync(testDatabasePath)) {
  fs.unlinkSync(testDatabasePath);
}