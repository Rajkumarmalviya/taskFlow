import { Router } from "express";

import {
  getBoardController,
  getBoardTasksController,
} from "../controllers/boardController.js";

const router = Router();

// GET /api/boards/:boardId          → full board with columns + tasks
router.get("/:boardId", getBoardController);

// GET /api/boards/:boardId/tasks    → flat task list, supports ?priority= and ?search=
router.get("/:boardId/tasks", getBoardTasksController);

export default router;
