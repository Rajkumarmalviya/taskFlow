import { useEffect, useRef, useState } from "react";
import { Modal, Button, Input, Select } from "../../ui";

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

  const titleRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    // autofocus title input when modal opens
    titleRef.current?.focus();
  }, []);

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
    <Modal onClose={onClose} labelledBy="task-modal-title">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="task-modal-title" className="text-xl font-bold">
            {isEditing ? "Edit task" : "Create task"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="task-title"
            label="Title *"
            ref={titleRef}
            value={title}
            onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTitle(event.target.value)}
            placeholder="Enter task title"
          />

          <Input
            id="task-description"
            textarea
            label="Description"
            value={description}
            onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDescription(event.target.value)}
            rows={4}
            placeholder="Optional description"
          />

          <Select
            id="task-priority"
            label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>

          {!isEditing && (
            <div>
              <Select
                id="task-column"
                label="Column"
                value={String(columnId)}
                onChange={(event) => setColumnId(Number(event.target.value))}
              >
                {columns.map((column) => (
                  <option key={column.id} value={String(column.id)}>
                    {column.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEditing ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
