import type { Task } from "../../types/task";

interface TaskCardProps {
  task: Task;
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

export default function TaskCard({
  task,
  columns,
  onEdit,
  onDelete,
  onMove
}: TaskCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">
          {task.title}
        </h3>

        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-slate-600">
          {task.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => onEdit(task)}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>

        <select
          value={task.column_id}
          onChange={(event) =>
            onMove(
              task.id,
              Number(event.target.value)
            )
          }
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        >
          {columns.map((column) => (
            <option
              key={column.id}
              value={column.id}
            >
              Move to {column.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}