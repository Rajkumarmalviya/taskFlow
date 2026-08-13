export type Priority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export interface BoardColumn {
  id: number;
  name: string;
  position: number;
  tasks: Task[];
}

export interface Board {
  id: number;
  name: string;
  created_at: string;
  columns: BoardColumn[];
}