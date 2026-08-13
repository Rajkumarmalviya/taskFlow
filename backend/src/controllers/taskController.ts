import { Request, Response } from "express";

import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTasksByPriority
} from "../services/taskService.js";

export function createTaskController(
  req: Request,
  res: Response
) {
  try {
    const task = createTask(req.body);

    res.status(201).json(task);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create task";

    res.status(400).json({
      error: message
    });
  }
}

export function updateTaskController(
  req: Request,
  res: Response
) {
  try {
    const taskId = Number(req.params.taskId);

    const task = updateTask(taskId, req.body);

    res.json(task);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update task";

    res.status(400).json({
      error: message
    });
  }
}

export function deleteTaskController(
  req: Request,
  res: Response
) {
  try {
    const taskId = Number(req.params.taskId);

    deleteTask(taskId);

    res.status(204).send();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete task";

    res.status(404).json({
      error: message
    });
  }
}

export function moveTaskController(
  req: Request,
  res: Response
) {
  try {
    const taskId = Number(req.params.taskId);
    const { columnId } = req.body;

    const task = moveTask(taskId, Number(columnId));

    res.json(task);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to move task";

    res.status(400).json({
      error: message
    });
  }
}

export function getTasksByPriorityController(
  req: Request,
  res: Response
) {
  try {
    const boardId = Number(req.params.boardId);
    const priority = String(req.query.priority);

    if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      return res.status(400).json({
        error: "Invalid priority"
      });
    }

    const tasks = getTasksByPriority(
      boardId,
      priority
    );

    res.json(tasks);
  } catch {
    res.status(500).json({
      error: "Failed to fetch tasks"
    });
  }
}