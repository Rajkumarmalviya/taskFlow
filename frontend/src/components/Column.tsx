import type {
  BoardColumn,
  Task
} from "../types/task";

import TaskCard from "./TaskCard";

interface ColumnProps {
  column: BoardColumn;
  columns: {
    id: number;
    name: string;
  }[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onMove: (
    taskId: number,
    columnId: number
  ) => void;
}

export default function Column({
  column,
  columns,
  onEdit,
  onDelete,
  onMove
}: ColumnProps) {
  return (
    <section className="min-w-0 rounded-2xl bg-slate-100 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-slate-800">
          {column.name}
        </h2>

        <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">
          {column.tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {column.tasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No tasks
          </p>
        ) : (
          column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </section>
  );
}