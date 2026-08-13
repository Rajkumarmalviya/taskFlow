import type { Task } from "../../types/task";

interface TaskCardProps {
  task: Task;
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

export default function TaskCard({
  task,
  columns,
  onViewDetail,
  onEdit,
  onDelete,
  onMove
}: TaskCardProps) {
  const priorityColor =
    task.priority === "HIGH"
      ? "bg-red-50 text-red-700"
      : task.priority === "LOW"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700";

  return (
    <article className="task-card rounded-xl bg-white p-4">
      {/* Clickable body — opens detail modal */}
      <button
        type="button"
        onClick={() => onViewDetail(task)}
        className="w-full text-left"
        aria-label={`View details for ${task.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {task.title}
            </h3>

            {task.description && (
              <p className="mt-2 text-sm text-slate-600 task-desc-truncate">
                {task.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColor}`}>
              {task.priority}
            </span>

            <time className="text-xs text-slate-400">
              {task.created_at
                ? new Date(task.created_at).toLocaleString()
                : ""}
            </time>
          </div>
        </div>
      </button>

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
            <option key={column.id} value={column.id}>
              Move to {column.name}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}