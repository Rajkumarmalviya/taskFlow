import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Task } from "../../types/task";
import { Badge } from "../../ui";

interface TaskCardProps {
  task: Task;
  onViewDetail: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export default function TaskCard({
  task,
  onViewDetail,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };


  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 h-24 opacity-50"
      />
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="task-card rounded-xl bg-white p-4 shadow-sm"
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${task.title}`}
          className="mt-1 shrink-0 touch-none cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="7" cy="5"  r="1.5" />
            <circle cx="13" cy="5"  r="1.5" />
            <circle cx="7" cy="10" r="1.5" />
            <circle cx="13" cy="10" r="1.5" />
            <circle cx="7" cy="15" r="1.5" />
            <circle cx="13" cy="15" r="1.5" />
          </svg>
        </button>

        {/* Clickable body */}
        <button
          type="button"
          onClick={() => onViewDetail(task)}
          className="min-w-0 flex-1 text-left"
          aria-label={`View details for ${task.title}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {task.title}
              </h3>

              {task.description && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <Badge variant={task.priority}>{task.priority}</Badge>

              <time className="text-xs text-slate-400">
                {new Date(task.created_at).toLocaleDateString()}
              </time>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 pl-6">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
