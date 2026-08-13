import { describe, expect, beforeEach, test } from "vitest";

import { resetDatabase } from "./testDatabase.js";
import {
  createTask,
  moveTask,
  getTaskCountPerColumn,
  getTasksByPriority
} from "../services/taskService.js";

describe("Task service", () => {
  let board: ReturnType<typeof resetDatabase>;

  beforeEach(() => {
    board = resetDatabase();
  });

  test("creating a task with an empty title fails", () => {
    expect(() => {
      createTask({
        columnId: board.todoId,
        title: "   ",
        priority: "HIGH"
      });
    }).toThrow("Title is required");
  });


  test("moving a task updates its column", () => {
  const task = createTask({
    columnId: board.todoId,
    title: "Task to move",
    priority: "MEDIUM"
  }) as {
    id: number;
    column_id: number;
  };

  expect(task.column_id).toBe(board.todoId);

  const movedTask = moveTask(
    task.id,
    board.progressId
  ) as {
    id: number;
    column_id: number;
  };

  expect(movedTask.column_id).toBe(
    board.progressId
  );

  
  
});

test("returns the correct task count per column", () => {
  const results = getTaskCountPerColumn(
    board.boardId
  ) as Array<{
    id: number;
    name: string;
    task_count: number;
  }>;

  expect(results).toEqual([
    {
      id: board.todoId,
      name: "To Do",
      task_count: 2
    },
    {
      id: board.progressId,
      name: "In Progress",
      task_count: 1
    },
    {
      id: board.doneId,
      name: "Done",
      task_count: 0
    }
  ]);
});
test("filters tasks by priority", () => {
  const results = getTasksByPriority(
    board.boardId,
    "HIGH"
  ) as Array<{
    title: string;
    priority: string;
  }>;

  expect(results).toHaveLength(2);

  expect(
    results.every(
      (task) => task.priority === "HIGH"
    )
  ).toBe(true);
});

});