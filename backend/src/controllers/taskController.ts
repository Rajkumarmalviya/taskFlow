import { Request, Response, NextFunction } from "express";

import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTasksByPriority,
  reorderTasks,
} from "../services/taskService.js";
import { AppError } from "../middleware/errorHandler.js";
import { PRIORITIES, Priority } from "../types/index.js";

// ─── POST /api/tasks ──────────────────────────────────────────────────────────

export async function createTaskController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = createTask({
      columnId: Number(req.body.columnId),
      title: String(req.body.title),
      description: req.body.description !== undefined ? String(req.body.description) : undefined,
      priority: req.body.priority as Priority | undefined,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/tasks/:taskId ─────────────────────────────────────────────────

export async function updateTaskController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskId = Number(req.params.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new AppError("taskId must be a positive integer", 400);
    }

    const task = updateTask(taskId, {
      title: req.body.title !== undefined ? String(req.body.title) : undefined,
      description: req.body.description !== undefined ? String(req.body.description) : undefined,
      priority: req.body.priority as Priority | undefined,
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/tasks/:taskId ────────────────────────────────────────────────

export async function deleteTaskController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskId = Number(req.params.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new AppError("taskId must be a positive integer", 400);
    }

    deleteTask(taskId);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/tasks/:taskId/move ───────────────────────────────────────────

export async function moveTaskController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskId = Number(req.params.taskId);
    const columnId = Number(req.body.columnId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new AppError("taskId must be a positive integer", 400);
    }

    if (!Number.isInteger(columnId) || columnId <= 0) {
      throw new AppError("columnId must be a positive integer", 400);
    }

    const task = moveTask(taskId, columnId);

    res.json(task);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/tasks/by-priority?boardId=&priority= ───────────────────────────

export async function getTasksByPriorityController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const boardId = Number(req.query.boardId);
    const priority = String(req.query.priority ?? "");

    if (!Number.isInteger(boardId) || boardId <= 0) {
      throw new AppError("boardId must be a positive integer", 400);
    }

    if (!PRIORITIES.includes(priority as Priority)) {
      throw new AppError(`priority must be one of: ${PRIORITIES.join(", ")}`, 400);
    }

    const tasks = getTasksByPriority(boardId, priority);

    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/tasks/reorder ─────────────────────────────────────────────────

export async function reorderTasksController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const columnId = Number(req.body.columnId);
    const orderedIds: unknown = req.body.orderedIds;

    if (!Number.isInteger(columnId) || columnId <= 0) {
      throw new AppError("columnId must be a positive integer", 400);
    }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new AppError("orderedIds must be a non-empty array", 400);
    }

    const parsedIds = orderedIds.map((id) => {
      const n = Number(id);
      if (!Number.isInteger(n) || n <= 0) {
        throw new AppError("Every element of orderedIds must be a positive integer", 400);
      }
      return n;
    });

    reorderTasks(columnId, parsedIds);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
