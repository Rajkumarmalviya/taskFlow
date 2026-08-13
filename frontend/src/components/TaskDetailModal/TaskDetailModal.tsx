import type { Task } from "../../types/task";

interface TaskDetailModalProps {
  task: Task;
  columnName: string;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

const priorityStyles: Record<
  Task["priority"],
  { badge: string; dot: string; label: string }
> = {
  HIGH: {
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    label: "High",
  },
  MEDIUM: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    label: "Medium",
  },
  LOW: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Low",
  },
};

export default function TaskDetailModal({
  task,
  columnName,
  onClose,
  onEdit,
}: TaskDetailModalProps) {
  const priority = priorityStyles[task.priority];

  function handleBackdropMouseDown(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              {columnName}
            </p>

            <h2
              id="detail-modal-title"
              className="text-xl font-bold text-slate-900"
            >
              {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail"
            className="mt-0.5 shrink-0 rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Priority */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Priority
            </p>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${priority.badge}`}
            >
              <span className={`h-2 w-2 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>
          </div>

          {/* Description */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </p>

            {task.description ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {task.description}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">
                No description provided.
              </p>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Created
              </p>

              <p className="text-sm text-slate-600">
                {new Date(task.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Last updated
              </p>

              <p className="text-sm text-slate-600">
                {new Date(task.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(task);
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Edit task
          </button>
        </div>
      </div>
    </div>
  );
}
