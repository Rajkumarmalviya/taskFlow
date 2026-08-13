import { Request, Response, NextFunction } from "express";

import { getBoardById, getFilteredTasks } from "../services/taskService.js";
import { AppError } from "../middleware/errorHandler.js";
import { PRIORITIES } from "../types/index.js";

// ─── GET /api/boards/:boardId ─────────────────────────────────────────────────

export async function getBoardController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const boardId = Number(req.params.boardId);

    if (!Number.isInteger(boardId) || boardId <= 0) {
      throw new AppError("boardId must be a positive integer", 400);
    }

    const board = getBoardById(boardId);

    if (!board) {
      throw new AppError("Board not found", 404);
    }

    res.json(board);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/boards/:boardId/tasks ──────────────────────────────────────────

export async function getBoardTasksController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const boardId = Number(req.params.boardId);

    if (!Number.isInteger(boardId) || boardId <= 0) {
      throw new AppError("boardId must be a positive integer", 400);
    }

    const priority = req.query.priority ? String(req.query.priority) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    if (priority && !PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
      throw new AppError(`priority must be one of: ${PRIORITIES.join(", ")}`, 400);
    }

    const tasks = getFilteredTasks(boardId, priority, search);

    res.json(tasks);
  } catch (err) {
    next(err);
  }
}
