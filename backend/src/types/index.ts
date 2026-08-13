// ─── Domain models ────────────────────────────────────────────────────────────

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: Priority;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface Board {
  id: number;
  name: string;
  created_at: string;
}

export interface BoardWithColumns extends Board {
  columns: ColumnWithTasks[];
}

// ─── Service input types ───────────────────────────────────────────────────────

export interface CreateTaskInput {
  columnId: number;
  title: string;
  description?: string;
  priority?: Priority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
}

// ─── Aggregation types ────────────────────────────────────────────────────────

export interface ColumnTaskCount {
  id: number;
  name: string;
  task_count: number;
}

// ─── API response envelope ────────────────────────────────────────────────────

export interface ApiError {
  error: string;
}
