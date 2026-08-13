import { Router } from "express";

import {
  createTaskController,
  updateTaskController,
  deleteTaskController,
  moveTaskController,
  getTasksByPriorityController,
  reorderTasksController,
} from "../controllers/taskController.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// POST /api/tasks
// Create a new task. columnId and title are required.
router.post(
  "/",
  validate({
    columnId:    { source: "body", required: true, isPositiveInt: true },
    title:       { source: "body", required: true, maxLength: 255 },
    description: { source: "body", maxLength: 2000 },
    priority:    { source: "body", oneOf: ["LOW", "MEDIUM", "HIGH"] },
  }),
  createTaskController
);

// GET /api/tasks/by-priority?boardId=&priority=
// Must be declared before /:taskId to avoid collision
router.get(
  "/by-priority",
  validate({
    boardId: { source: "query", required: true, isPositiveInt: true },
    priority: { source: "query", required: true, oneOf: ["LOW", "MEDIUM", "HIGH"] },
  }),
  getTasksByPriorityController
);

// PATCH /api/tasks/reorder
// Bulk-reorder tasks inside a column. Must be before /:taskId.
router.patch(
  "/reorder",
  validate({
    columnId: { source: "body", required: true, isPositiveInt: true },
  }),
  reorderTasksController
);

// PATCH /api/tasks/:taskId
// Partial update of title, description, or priority.
router.patch("/:taskId", updateTaskController);

// DELETE /api/tasks/:taskId
router.delete("/:taskId", deleteTaskController);

// PATCH /api/tasks/:taskId/move
// Move task to a different column.
router.patch(
  "/:taskId/move",
  validate({
    columnId: { source: "body", required: true, isPositiveInt: true },
  }),
  moveTaskController
);

export default router;
