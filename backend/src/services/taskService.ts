import db from "../db/database.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  Task,
  Board,
  Column,
  ColumnWithTasks,
  BoardWithColumns,
  ColumnTaskCount,
  CreateTaskInput,
  UpdateTaskInput,
  PRIORITIES,
} from "../types/index.js";

// ─── Board ────────────────────────────────────────────────────────────────────

export function getBoardById(boardId: number): BoardWithColumns | null {
  const board = db
    .prepare<[number], Board>(
      `SELECT id, name, created_at FROM boards WHERE id = ?`
    )
    .get(boardId);

  if (!board) return null;

  const columns = db
    .prepare<[number], Column>(
      `SELECT id, board_id, name, position
       FROM columns
       WHERE board_id = ?
       ORDER BY position ASC`
    )
    .all(boardId);

  const tasks = db
    .prepare<[number], Task>(
      `SELECT id, column_id, title, description, priority, position, created_at, updated_at
       FROM tasks
       WHERE column_id IN (SELECT id FROM columns WHERE board_id = ?)
       ORDER BY position ASC, created_at ASC`
    )
    .all(boardId);

  return {
    ...board,
    columns: columns.map((col): ColumnWithTasks => ({
      ...col,
      tasks: tasks.filter((t) => t.column_id === col.id),
    })),
  };
}

// ─── Task CRUD ────────────────────────────────────────────────────────────────

export function createTask(data: CreateTaskInput): Task {
  const title = data.title.trim();
  if (!title) throw new AppError("Title is required", 400);
  if (title.length > 255) throw new AppError("Title must not exceed 255 characters", 400);

  const description = data.description ?? null;
  if (description !== null && description.length > 2000) {
    throw new AppError("Description must not exceed 2000 characters", 400);
  }

  const priority = data.priority ?? "MEDIUM";
  if (!PRIORITIES.includes(priority)) throw new AppError("Invalid priority", 400);

  const column = db
    .prepare<[number], Column>(`SELECT id, board_id, name, position FROM columns WHERE id = ?`)
    .get(data.columnId);
  if (!column) throw new AppError("Column not found", 404);

  const result = db
    .prepare<[number, string, string | null, string, number]>(
      `INSERT INTO tasks (column_id, title, description, priority, position)
       VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(position) + 1, 0) FROM tasks WHERE column_id = ?))`
    )
    .run(data.columnId, title, description, priority, data.columnId);

  return db
    .prepare<[bigint | number], Task>(`SELECT * FROM tasks WHERE id = ?`)
    .get(result.lastInsertRowid) as Task;
}

export function updateTask(taskId: number, data: UpdateTaskInput): Task {
  const existing = db
    .prepare<[number], Task>(`SELECT * FROM tasks WHERE id = ?`)
    .get(taskId);

  if (!existing) throw new AppError("Task not found", 404);

  const title = data.title !== undefined ? data.title.trim() : existing.title;
  if (!title) throw new AppError("Title is required", 400);
  if (title.length > 255) throw new AppError("Title must not exceed 255 characters", 400);

  const description = data.description !== undefined ? data.description : existing.description;
  if (description !== null && description !== undefined && description.length > 2000) {
    throw new AppError("Description must not exceed 2000 characters", 400);
  }
  const priority = data.priority ?? existing.priority;

  if (!PRIORITIES.includes(priority)) throw new AppError("Invalid priority", 400);

  db.prepare(
    `UPDATE tasks
     SET title = ?, description = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(title, description, priority, taskId);

  return db
    .prepare<[number], Task>(`SELECT * FROM tasks WHERE id = ?`)
    .get(taskId) as Task;
}

export function deleteTask(taskId: number): void {
  const result = db
    .prepare(`DELETE FROM tasks WHERE id = ?`)
    .run(taskId);

  if (result.changes === 0) throw new AppError("Task not found", 404);
}

export function moveTask(taskId: number, columnId: number): Task {
  const task = db
    .prepare<[number], Pick<Task, "id">>(`SELECT id FROM tasks WHERE id = ?`)
    .get(taskId);
  if (!task) throw new AppError("Task not found", 404);

  const column = db
    .prepare<[number], Pick<Column, "id">>(`SELECT id FROM columns WHERE id = ?`)
    .get(columnId);
  if (!column) throw new AppError("Column not found", 404);

  db.prepare(
    `UPDATE tasks
     SET column_id = ?,
         position  = (SELECT COALESCE(MAX(position) + 1, 0) FROM tasks WHERE column_id = ?),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(columnId, columnId, taskId);

  return db
    .prepare<[number], Task>(`SELECT * FROM tasks WHERE id = ?`)
    .get(taskId) as Task;
}

// ─── Query helpers ────────────────────────────────────────────────────────────

export function getTasksByPriority(boardId: number, priority: string): Task[] {
  return db
    .prepare<[number, string], Task>(
      `SELECT t.id, t.column_id, t.title, t.description, t.priority,
              t.position, t.created_at, t.updated_at
       FROM tasks t
       JOIN columns c ON t.column_id = c.id
       WHERE c.board_id = ? AND t.priority = ?
       ORDER BY t.created_at DESC`
    )
    .all(boardId, priority);
}

export function getTaskCountPerColumn(boardId: number): ColumnTaskCount[] {
  return db
    .prepare<[number], ColumnTaskCount>(
      `SELECT c.id, c.name, COUNT(t.id) AS task_count
       FROM columns c
       LEFT JOIN tasks t ON t.column_id = c.id
       WHERE c.board_id = ?
       GROUP BY c.id, c.name
       ORDER BY c.position`
    )
    .all(boardId);
}

export function searchTasks(boardId: number, search: string): Task[] {
  return db
    .prepare<[number, string], Task>(
      `SELECT t.id, t.column_id, t.title, t.description, t.priority,
              t.position, t.created_at, t.updated_at
       FROM tasks t
       JOIN columns c ON t.column_id = c.id
       WHERE c.board_id = ? AND LOWER(t.title) LIKE LOWER(?)
       ORDER BY t.created_at DESC`
    )
    .all(boardId, `%${search}%`);
}

export function getFilteredTasks(
  boardId: number,
  priority?: string,
  search?: string
): Task[] {
  return db
    .prepare<[number, string | null, string | null, string | null, string | null], Task>(
      `SELECT t.id, t.column_id, t.title, t.description, t.priority,
              t.position, t.created_at, t.updated_at
       FROM tasks t
       JOIN columns c ON t.column_id = c.id
       WHERE c.board_id = ?
         AND (? IS NULL OR t.priority = ?)
         AND (? IS NULL OR LOWER(t.title) LIKE LOWER(?))
       ORDER BY t.created_at DESC`
    )
    .all(
      boardId,
      priority ?? null,
      priority ?? null,
      search ?? null,
      search ? `%${search}%` : null
    );
}

/**
 * Bulk-update the position of tasks within a column.
 * `orderedIds` must be the complete ordered array of task IDs for that column.
 * Throws 400 if any ID does not belong to the column (integrity guard).
 */
export function reorderTasks(columnId: number, orderedIds: number[]): void {
  const column = db
    .prepare<[number], Pick<Column, "id">>(`SELECT id FROM columns WHERE id = ?`)
    .get(columnId);

  if (!column) throw new AppError("Column not found", 404);

  // Verify every submitted ID actually belongs to this column
  const placeholders = orderedIds.map(() => "?").join(", ");
  const rows = db
    .prepare<number[], Pick<Task, "id">>(
      `SELECT id FROM tasks WHERE id IN (${placeholders}) AND column_id = ?`
    )
    .all(...orderedIds, columnId);

  if (rows.length !== orderedIds.length) {
    throw new AppError(
      "One or more task IDs do not belong to the specified column",
      400
    );
  }

  const update = db.prepare<[number, number, number]>(
    `UPDATE tasks SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND column_id = ?`
  );

  const tx = db.transaction(() => {
    for (const [index, id] of orderedIds.entries()) {
      update.run(index, id, columnId);
    }
  });

  tx();
}
