import express from "express";
import cors from "cors";

import "./db/database.js";

import boardRoutes from "./routes/boardRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    message: "TaskFlow API is running"
  });
});

app.use(
  "/api/boards",
  boardRoutes
);

app.use(
  "/api/tasks",
  taskRoutes
);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});