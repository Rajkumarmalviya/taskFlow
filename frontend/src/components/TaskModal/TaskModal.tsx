import { useEffect, useState } from "react";

import type {
  Priority,
  Task
} from "../../types/task";

interface ColumnOption {
  id: number;
  name: string;
}

interface TaskModalProps {
  task: Task | null;
  columns: ColumnOption[];
  defaultColumnId: number;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    priority: Priority;
    columnId: number;
  }) => Promise<void>;
}

export default function TaskModal({
  task,
  columns,
  defaultColumnId,
  onClose,
  onSave
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [priority, setPriority] =
    useState<Priority>("MEDIUM");
  const [columnId, setColumnId] =
    useState(defaultColumnId);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const isEditing = task !== null;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(
        task.description ?? ""
      );
      setPriority(task.priority);
      setColumnId(task.column_id);
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setColumnId(defaultColumnId);
    }

    setError(null);
  }, [task, defaultColumnId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        columnId
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save task"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditing
              ? "Edit task"
              : "Create task"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="task-title"
              className="mb-1 block text-sm font-medium"
            >
              Title *
            </label>

            <input
              id="task-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter task title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Optional description"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="task-priority"
              className="mb-1 block text-sm font-medium"
            >
              Priority
            </label>

            <select
              id="task-priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as Priority
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>
            </select>
          </div>

          {!isEditing && (
            <div>
              <label
                htmlFor="task-column"
                className="mb-1 block text-sm font-medium"
              >
                Column
              </label>

              <select
                id="task-column"
                value={columnId}
                onChange={(event) =>
                  setColumnId(
                    Number(event.target.value)
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {columns.map((column) => (
                  <option
                    key={column.id}
                    value={column.id}
                  >
                    {column.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}