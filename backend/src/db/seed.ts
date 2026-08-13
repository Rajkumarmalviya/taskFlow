import db from "./database.js";

const existingBoard = db
  .prepare("SELECT id FROM boards LIMIT 1")
  .get();

if (existingBoard) {
  console.log("Database already contains seed data.");
  process.exit(0);
}

const insertBoard = db.prepare(`
  INSERT INTO boards (name)
  VALUES (?)
`);

const insertColumn = db.prepare(`
  INSERT INTO columns (board_id, name, position)
  VALUES (?, ?, ?)
`);

const insertTask = db.prepare(`
  INSERT INTO tasks (column_id, title, description, priority)
  VALUES (?, ?, ?, ?)
`);

const seed = db.transaction(() => {
  const boardResult = insertBoard.run("TaskFlow Board");

  const boardId = Number(boardResult.lastInsertRowid);

  const todoResult = insertColumn.run(
    boardId,
    "To Do",
    1
  );

  const progressResult = insertColumn.run(
    boardId,
    "In Progress",
    2
  );

  const doneResult = insertColumn.run(
    boardId,
    "Done",
    3
  );

  const todoId = Number(todoResult.lastInsertRowid);
  const progressId = Number(progressResult.lastInsertRowid);
  const doneId = Number(doneResult.lastInsertRowid);

  insertTask.run(
    todoId,
    "Setup project",
    "Initialize the TaskFlow project",
    "HIGH"
  );

  insertTask.run(
    todoId,
    "Design database",
    "Create relational database schema",
    "MEDIUM"
  );

  insertTask.run(
    progressId,
    "Build REST API",
    "Implement task management endpoints",
    "HIGH"
  );

  insertTask.run(
    doneId,
    "Create README",
    "Document the project",
    "LOW"
  );
});

seed();

console.log("Seed data inserted successfully.");