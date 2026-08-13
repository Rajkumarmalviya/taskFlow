import { Request, Response } from "express";

import {
  getBoardById,
  getFilteredTasks
} from "../services/taskService.js";

export function getBoardController(
  req: Request,
  res: Response
) {
  try {
    const boardId = Number(req.params.boardId);

    const board = getBoardById(boardId);

    if (!board) {
      return res.status(404).json({
        error: "Board not found"
      });
    }

    return res.json(board);
  } catch {
    return res.status(500).json({
      error: "Failed to fetch board"
    });
  }
}

export function getBoardTasksController(
  req: Request,
  res: Response
) {
  try {
    const boardId = Number(req.params.boardId);

    const priority = req.query.priority
      ? String(req.query.priority)
      : undefined;

    const search = req.query.search
      ? String(req.query.search)
      : undefined;

    if (
      priority &&
      !["LOW", "MEDIUM", "HIGH"].includes(priority)
    ) {
      return res.status(400).json({
        error: "Invalid priority"
      });
    }

    const tasks = getFilteredTasks(
      boardId,
      priority,
      search
    );

    return res.json(tasks);
  } catch {
    return res.status(500).json({
      error: "Failed to fetch tasks"
    });
  }
}