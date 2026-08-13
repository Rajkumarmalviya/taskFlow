import db from "../db/database.js";

export function getBoardById(boardId: number) {
  const board = db
    .prepare(`
      SELECT id, name, created_at
      FROM boards
      WHERE id = ?
    `)
    .get(boardId);

  if (!board) {
    return null;
  }

  const columns = db
    .prepare(`
      SELECT id, name, position
      FROM columns
      WHERE board_id = ?
      ORDER BY position ASC
    `)
    .all(boardId);

  const tasks = db
    .prepare(`
      SELECT
        id,
        column_id,
        title,
        description,
        priority,
        created_at,
        updated_at
      FROM tasks
      WHERE column_id IN (
        SELECT id
        FROM columns
        WHERE board_id = ?
      )
      ORDER BY created_at DESC
    `)
    .all(boardId);

  return {
    ...board,
    columns: columns.map((column: any) => ({
      ...column,
      tasks: tasks.filter(
        (task: any) => task.column_id === column.id
      )
    }))
  };
}



export function createTask(data: {
  columnId: number;
  title: string;
  description?: string;
  priority?: string;
}) {
  const title = data.title.trim();

  if (!title) {
    throw new Error("Title is required");
  }

  const priority = data.priority ?? "MEDIUM";

  if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
    throw new Error("Invalid priority");
  }

  const column = db
    .prepare(`
      SELECT id
      FROM columns
      WHERE id = ?
    `)
    .get(data.columnId);

  if (!column) {
    throw new Error("Column not found");
  }

  const result = db
    .prepare(`
      INSERT INTO tasks (
        column_id,
        title,
        description,
        priority
      )
      VALUES (?, ?, ?, ?)
    `)
    .run(
      data.columnId,
      title,
      data.description ?? null,
      priority
    );

  return db
    .prepare(`
      SELECT *
      FROM tasks
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);
}


export function updateTask(
  taskId: number,
  data: {
    title?: string;
    description?: string;
    priority?: string;
  }
) {
  const existingTask = db
    .prepare(`
      SELECT *
      FROM tasks
      WHERE id = ?
    `)
    .get(taskId) as any;

  if (!existingTask) {
    throw new Error("Task not found");
  }

  const title =
    data.title !== undefined
      ? data.title.trim()
      : existingTask.title;

  if (!title) {
    throw new Error("Title is required");
  }

  const description =
    data.description !== undefined
      ? data.description
      : existingTask.description;

  const priority =
    data.priority ?? existingTask.priority;

  if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
    throw new Error("Invalid priority");
  }

  db.prepare(`
    UPDATE tasks
    SET
      title = ?,
      description = ?,
      priority = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title,
    description,
    priority,
    taskId
  );

  return db
    .prepare(`
      SELECT *
      FROM tasks
      WHERE id = ?
    `)
    .get(taskId);
}

export function deleteTask(taskId: number) {
  const result = db
    .prepare(`
      DELETE FROM tasks
      WHERE id = ?
    `)
    .run(taskId);

  if (result.changes === 0) {
    throw new Error("Task not found");
  }
}


export function moveTask(
  taskId: number,
  columnId: number
) {
  const task = db
    .prepare(`
      SELECT id
      FROM tasks
      WHERE id = ?
    `)
    .get(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const column = db
    .prepare(`
      SELECT id
      FROM columns
      WHERE id = ?
    `)
    .get(columnId);

  if (!column) {
    throw new Error("Column not found");
  }

  db.prepare(`
    UPDATE tasks
    SET
      column_id = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(columnId, taskId);

  return db
    .prepare(`
      SELECT *
      FROM tasks
      WHERE id = ?
    `)
    .get(taskId);
}


export function getTasksByPriority(
  boardId: number,
  priority: string
) {
  return db
    .prepare(`
      SELECT
        t.id,
        t.title,
        t.description,
        t.priority,
        t.created_at,
        c.name AS column_name
      FROM tasks t
      JOIN columns c
        ON t.column_id = c.id
      WHERE c.board_id = ?
        AND t.priority = ?
      ORDER BY t.created_at DESC
    `)
    .all(boardId, priority);
}


export function getTaskCountPerColumn(
  boardId: number
) {
  return db
    .prepare(`
      SELECT
        c.id,
        c.name,
        COUNT(t.id) AS task_count
      FROM columns c
      LEFT JOIN tasks t
        ON t.column_id = c.id
      WHERE c.board_id = ?
      GROUP BY c.id, c.name
      ORDER BY c.position
    `)
    .all(boardId);
}


export function searchTasks(
  boardId: number,
  search: string
) {
  return db
    .prepare(`
      SELECT
        t.id,
        t.column_id,
        t.title,
        t.description,
        t.priority,
        t.created_at,
        t.updated_at
      FROM tasks t
      JOIN columns c
        ON t.column_id = c.id
      WHERE c.board_id = ?
        AND LOWER(t.title) LIKE LOWER(?)
      ORDER BY t.created_at DESC
    `)
    .all(
      boardId,
      `%${search}%`
    );
}

export function getFilteredTasks(
  boardId: number,
  priority?: string,
  search?: string
) {
  return db
    .prepare(`
      SELECT
        t.id,
        t.column_id,
        t.title,
        t.description,
        t.priority,
        t.created_at,
        t.updated_at
      FROM tasks t
      JOIN columns c
        ON t.column_id = c.id
      WHERE c.board_id = ?
        AND (? IS NULL OR t.priority = ?)
        AND (? IS NULL OR LOWER(t.title) LIKE LOWER(?))
      ORDER BY t.created_at DESC
    `)
    .all(
      boardId,
      priority ?? null,
      priority ?? null,
      search ?? null,
      search ? `%${search}%` : null
    );
}