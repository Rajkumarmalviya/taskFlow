import { Router } from "express";

import {
  getBoardController,
  getBoardTasksController
} from "../controllers/boardController.js";

const router = Router();

router.get(
  "/:boardId",
  getBoardController
);

router.get(
  "/:boardId/tasks",
  getBoardTasksController
);

export default router;