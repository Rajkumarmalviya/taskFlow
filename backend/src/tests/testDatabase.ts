import db from "../db/database.js";

export function resetDatabase() {
  db.exec(`
    DELETE FROM tasks;
    DELETE FROM columns;
    DELETE FROM boards;

    DELETE FROM sqlite_sequence
    WHERE name IN ('tasks', 'columns', 'boards');
  `);

  const boardResult = db
    .prepare(`
      INSERT INTO boards (name)
      VALUES (?)
    `)
    .run("Test Board");

  const boardId = Number(
    boardResult.lastInsertRowid
  );

  const todoResult = db
    .prepare(`
      INSERT INTO columns (
        board_id,
        name,
        position
      )
      VALUES (?, ?, ?)
    `)
    .run(boardId, "To Do", 1);

  const progressResult = db
    .prepare(`
      INSERT INTO columns (
        board_id,
        name,
        position
      )
      VALUES (?, ?, ?)
    `)
    .run(boardId, "In Progress", 2);

  const doneResult = db
    .prepare(`
      INSERT INTO columns (
        board_id,
        name,
        position
      )
      VALUES (?, ?, ?)
    `)
    .run(boardId, "Done", 3);

  const todoId = Number(
    todoResult.lastInsertRowid
  );

  const progressId = Number(
    progressResult.lastInsertRowid
  );

  const doneId = Number(
    doneResult.lastInsertRowid
  );

  db.prepare(`
    INSERT INTO tasks (
      column_id,
      title,
      priority
    )
    VALUES (?, ?, ?)
  `).run(
    todoId,
    "Test task one",
    "HIGH"
  );

  db.prepare(`
    INSERT INTO tasks (
      column_id,
      title,
      priority
    )
    VALUES (?, ?, ?)
  `).run(
    todoId,
    "Test task two",
    "MEDIUM"
  );

  db.prepare(`
    INSERT INTO tasks (
      column_id,
      title,
      priority
    )
    VALUES (?, ?, ?)
  `).run(
    progressId,
    "Test task three",
    "HIGH"
  );

  return {
    boardId,
    todoId,
    progressId,
    doneId
  };
}