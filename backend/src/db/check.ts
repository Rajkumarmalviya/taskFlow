import db from "./database.js";

const boards = db
  .prepare("SELECT * FROM boards")
  .all();

const columns = db
  .prepare("SELECT * FROM columns")
  .all();

const tasks = db
  .prepare("SELECT * FROM tasks")
  .all();

console.log("Boards:", boards);
console.log("Columns:", columns);
console.log("Tasks:", tasks);