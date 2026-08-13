import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type { Board as BoardType, BoardColumn, Task } from "../../types/task";
import Column from "./Column";

interface BoardProps {
  board: BoardType;
  onViewDetail: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onMove: (taskId: number, toColumnId: number) => Promise<void>;
  onReorder: (columnId: number, orderedIds: number[]) => void;
}

export default function Board({
  board,
  onViewDetail,
  onEdit,
  onDelete,
  onMove,
  onReorder,
}: BoardProps) {
  const [columns, setColumns] =
    useState<BoardColumn[]>(board.columns);

  const [activeTask, setActiveTask] =
    useState<Task | null>(null);

  const [overColumnId, setOverColumnId] =
    useState<number | null>(null);

  // The column the card started in — set once on dragStart, never mutated
  const originalColumnId = useRef<number | null>(null);
  // Tracks where the card currently is during drag (updated in onDragOver)
  const currentColumnId  = useRef<number | null>(null);

  // Sync columns from server when board prop changes, but never mid-drag
  const lastBoardRef = useRef<BoardType>(board);
  if (board !== lastBoardRef.current && activeTask === null) {
    lastBoardRef.current = board;
    setColumns(board.columns);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // ── helpers ──────────────────────────────────────────────

  function getColumnIdFromDroppableId(id: string | number): number | null {
    const str = String(id);
    if (str.startsWith("col-")) return Number(str.replace("col-", ""));
    // It's a task id — find which column currently holds it
    const col = columns.find((c) => c.tasks.some((t) => t.id === Number(str)));
    return col?.id ?? null;
  }

  // ── drag handlers ─────────────────────────────────────────

  function handleDragStart({ active }: DragStartEvent) {
    const task = active.data.current?.task as Task | undefined;
    if (!task) return;

    setActiveTask(task);

    const sourceCol = columns.find((c) => c.tasks.some((t) => t.id === task.id));
    originalColumnId.current = sourceCol?.id ?? null;
    currentColumnId.current  = sourceCol?.id ?? null;
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) { setOverColumnId(null); return; }

    const activeId = Number(active.id);
    const toColId  = getColumnIdFromDroppableId(over.id);
    if (toColId === null) { setOverColumnId(null); return; }

    setOverColumnId(toColId);

    const fromColId = currentColumnId.current;
    if (fromColId === null || fromColId === toColId) return;

    // Cross-column live preview
    setColumns((prev) => {
      const fromCol = prev.find((c) => c.id === fromColId);
      if (!fromCol) return prev;

      const task = fromCol.tasks.find((t) => t.id === activeId);
      if (!task) return prev;

      return prev.map((col) => {
        if (col.id === fromColId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
        }
        if (col.id === toColId) {
          const overIndex = col.tasks.findIndex((t) => t.id === Number(over.id));
          const newTasks  = [...col.tasks];
          const moved     = { ...task, column_id: toColId };
          overIndex === -1 ? newTasks.push(moved) : newTasks.splice(overIndex, 0, moved);
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });

    // Update current position tracker (NOT original)
    currentColumnId.current = toColId;
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    const srcColId  = originalColumnId.current;
    const destColId = currentColumnId.current;

    setActiveTask(null);
    setOverColumnId(null);
    originalColumnId.current = null;
    currentColumnId.current  = null;

    if (!over || srcColId === null || destColId === null) {
      setColumns(board.columns);
      return;
    }

    const activeId = Number(active.id);

    if (srcColId === destColId) {
      // Same-column reorder
      setColumns((prev) => {
        const col = prev.find((c) => c.id === srcColId);
        if (!col) return prev;

        const oldIndex = col.tasks.findIndex((t) => t.id === activeId);
        const newIndex = col.tasks.findIndex((t) => t.id === Number(over.id));
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;

        const reordered = arrayMove(col.tasks, oldIndex, newIndex);
        onReorder(srcColId, reordered.map((t) => t.id));
        return prev.map((c) =>
          c.id === srcColId ? { ...c, tasks: reordered } : c
        );
      });
    } else {
      // Cross-column — call the API with the ORIGINAL source and final destination
      await onMove(activeId, destColId);

      // Persist the order of the destination column
      setColumns((prev) => {
        const destCol = prev.find((c) => c.id === destColId);
        if (destCol) onReorder(destColId, destCol.tasks.map((t) => t.id));
        return prev;
      });
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
    setOverColumnId(null);
    originalColumnId.current = null;
    currentColumnId.current  = null;
    setColumns(board.columns);
  }

  // ── overlay card ──────────────────────────────────────────

  function OverlayCard({ task }: { task: Task }) {
    const priorityColor =
      task.priority === "HIGH"
        ? "bg-red-50 text-red-700"
        : task.priority === "LOW"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-amber-50 text-amber-700";

    return (
      <div className="w-72 rounded-xl bg-white p-4 shadow-2xl ring-2 ring-slate-400 cursor-grabbing rotate-1 opacity-95">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-slate-900 truncate">{task.title}</h3>
          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${priorityColor}`}>
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="board-scroll flex gap-4 md:grid md:grid-cols-3">
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            isOver={overColumnId === col.id}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <OverlayCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
