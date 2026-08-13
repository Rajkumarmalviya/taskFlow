import type {
  BoardColumn,
  Task
} from "../../types/task";

import TaskCard from "./TaskCard";

interface ColumnProps {
  column: BoardColumn;
  columns: {
    id: number;
    name: string;
  }[];
  onViewDetail: (task: Task) => void;
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
  onViewDetail,
  onEdit,
  onDelete,
  onMove
}: ColumnProps) {
  return (
    <section className="min-w-[18rem] rounded-2xl bg-slate-100 p-4">
      <div className="mb-4 flex items-center justify-between sticky-header">
        <h2 className="font-bold text-slate-800">
          {column.name}
        </h2>

        <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">
          {column.tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {column.tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 py-6 text-center">
            <p className="text-sm text-slate-400">
              No tasks
            </p>
          </div>
        ) : (
          column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              onViewDetail={onViewDetail}
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