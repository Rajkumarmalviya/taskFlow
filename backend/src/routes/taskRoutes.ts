import { Router } from "express";

import {
  createTaskController,
  updateTaskController,
  deleteTaskController,
  moveTaskController,
  getTasksByPriorityController,
  reorderTasksController,
} from "../controllers/taskController.js";

const router = Router();

router.post("/", createTaskController);

router.patch(
  "/reorder",
  reorderTasksController
);

router.patch(
  "/:taskId",
  updateTaskController
);

router.delete(
  "/:taskId",
  deleteTaskController
);

router.patch(
  "/:taskId/move",
  moveTaskController
);

export default router;