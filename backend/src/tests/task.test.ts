import { describe, expect, beforeEach, test } from "vitest";

import { resetDatabase } from "./testDatabase.js";
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks,
  getTaskCountPerColumn,
  getTasksByPriority,
} from "../services/taskService.js";
import { AppError } from "../middleware/errorHandler.js";
import type { Task, ColumnTaskCount } from "../types/index.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function expectAppError(fn: () => unknown, statusCode: number, messagePart?: string) {
  let thrown: unknown;
  try {
    fn();
  } catch (err) {
    thrown = err;
  }
  expect(thrown).toBeInstanceOf(AppError);
  expect((thrown as AppError).statusCode).toBe(statusCode);
  if (messagePart) {
    expect((thrown as AppError).message.toLowerCase()).toContain(messagePart.toLowerCase());
  }
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe("taskService", () => {
  let board: ReturnType<typeof resetDatabase>;

  beforeEach(() => {
    board = resetDatabase();
  });

  // ── createTask ──────────────────────────────────────────────────────────

  describe("createTask", () => {
    test("creates a task and returns it", () => {
      const task = createTask({ columnId: board.todoId, title: "New task" }) as Task;
      expect(task.id).toBeTypeOf("number");
      expect(task.title).toBe("New task");
      expect(task.priority).toBe("MEDIUM"); // default
      expect(task.column_id).toBe(board.todoId);
    });

    test("rejects an empty (whitespace-only) title", () => {
      expectAppError(
        () => createTask({ columnId: board.todoId, title: "   " }),
        400,
        "title"
      );
    });

    test("rejects an invalid priority", () => {
      expectAppError(
        () => createTask({ columnId: board.todoId, title: "Task", priority: "URGENT" as any }),
        400,
        "priority"
      );
    });

    test("rejects a non-existent column", () => {
      expectAppError(
        () => createTask({ columnId: 9999, title: "Task" }),
        404,
        "column"
      );
    });
  });

  // ── updateTask ──────────────────────────────────────────────────────────

  describe("updateTask", () => {
    test("updates title and priority", () => {
      const created = createTask({ columnId: board.todoId, title: "Original" }) as Task;
      const updated = updateTask(created.id, { title: "Updated", priority: "HIGH" }) as Task;
      expect(updated.title).toBe("Updated");
      expect(updated.priority).toBe("HIGH");
    });

    test("rejects setting an empty title on update", () => {
      const created = createTask({ columnId: board.todoId, title: "Task" }) as Task;
      expectAppError(() => updateTask(created.id, { title: "" }), 400, "title");
    });

    test("throws 404 for a non-existent task", () => {
      expectAppError(() => updateTask(9999, { title: "X" }), 404, "task not found");
    });
  });

  // ── deleteTask ──────────────────────────────────────────────────────────

  describe("deleteTask", () => {
    test("deletes an existing task without error", () => {
      const created = createTask({ columnId: board.todoId, title: "To delete" }) as Task;
      expect(() => deleteTask(created.id)).not.toThrow();
    });

    test("throws 404 when deleting a non-existent task", () => {
      expectAppError(() => deleteTask(9999), 404, "task not found");
    });
  });

  // ── moveTask ────────────────────────────────────────────────────────────

  describe("moveTask", () => {
    test("moves a task to a different column", () => {
      const task = createTask({ columnId: board.todoId, title: "Task to move" }) as Task;
      expect(task.column_id).toBe(board.todoId);

      const moved = moveTask(task.id, board.progressId) as Task;
      expect(moved.column_id).toBe(board.progressId);
      expect(moved.id).toBe(task.id);
    });

    test("throws 404 for non-existent task", () => {
      expectAppError(() => moveTask(9999, board.progressId), 404, "task not found");
    });

    test("throws 404 for non-existent target column", () => {
      const task = createTask({ columnId: board.todoId, title: "T" }) as Task;
      expectAppError(() => moveTask(task.id, 9999), 404, "column not found");
    });
  });

  // ── reorderTasks ────────────────────────────────────────────────────────

  describe("reorderTasks", () => {
    test("reorders tasks within a column", () => {
      const t1 = createTask({ columnId: board.todoId, title: "A" }) as Task;
      const t2 = createTask({ columnId: board.todoId, title: "B" }) as Task;

      // Put t2 first, t1 second
      expect(() => reorderTasks(board.todoId, [t2.id, t1.id])).not.toThrow();
    });

    test("throws 404 for a non-existent column", () => {
      expectAppError(() => reorderTasks(9999, [1, 2]), 404, "column not found");
    });
  });

  // ── getTaskCountPerColumn ───────────────────────────────────────────────

  describe("getTaskCountPerColumn", () => {
    test("returns the correct count per column", () => {
      const results = getTaskCountPerColumn(board.boardId) as ColumnTaskCount[];

      expect(results).toEqual([
        { id: board.todoId,      name: "To Do",       task_count: 2 },
        { id: board.progressId,  name: "In Progress",  task_count: 1 },
        { id: board.doneId,      name: "Done",         task_count: 0 },
      ]);
    });

    test("total across all columns matches seeded tasks", () => {
      const results = getTaskCountPerColumn(board.boardId) as ColumnTaskCount[];
      const total = results.reduce((sum, r) => sum + r.task_count, 0);
      expect(total).toBe(3); // 3 tasks seeded in resetDatabase
    });
  });

  // ── getTasksByPriority ──────────────────────────────────────────────────

  describe("getTasksByPriority", () => {
    test("returns only HIGH priority tasks", () => {
      const results = getTasksByPriority(board.boardId, "HIGH") as Task[];
      expect(results.length).toBe(2); // "Test task one" + "Test task three"
      expect(results.every((t) => t.priority === "HIGH")).toBe(true);
    });

    test("returns only MEDIUM priority tasks", () => {
      const results = getTasksByPriority(board.boardId, "MEDIUM") as Task[];
      expect(results.length).toBe(1); // "Test task two"
      expect(results[0].priority).toBe("MEDIUM");
    });

    test("returns an empty array for LOW priority when none exist", () => {
      const results = getTasksByPriority(board.boardId, "LOW") as Task[];
      expect(results).toHaveLength(0);
    });
  });
});
