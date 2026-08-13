import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { BoardColumn, Task } from "../../types/task";
import TaskCard from "./TaskCard";

interface ColumnProps {
  column: BoardColumn;
  isOver: boolean;
  onViewDetail: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export default function Column({
  column,
  isOver,
  onViewDetail,
  onEdit,
  onDelete,
}: ColumnProps) {
  // The droppable covers the whole column so empty columns are still droppable
  const { setNodeRef } = useDroppable({
    id: `col-${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  const taskIds = column.tasks.map((t) => t.id);

  return (
    <section
      className={[
        "min-w-[18rem] rounded-2xl p-4 flex flex-col transition-colors duration-150",
        isOver ? "bg-slate-200" : "bg-slate-100",
      ].join(" ")}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-slate-800">{column.name}</h2>
        <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">
          {column.tasks.length}
        </span>
      </div>

      {/* Task list — sortable + droppable */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className="flex flex-col gap-3 flex-1 min-h-[5rem]"
        >
          {column.tasks.length === 0 ? (
            <div
              className={[
                "flex-1 rounded-xl border-2 border-dashed flex items-center justify-center py-8 transition-colors duration-150",
                isOver
                  ? "border-slate-400 bg-slate-300/30"
                  : "border-slate-200 bg-white/40",
              ].join(" ")}
            >
              <p className="text-sm text-slate-400">
                {isOver ? "Release to drop" : "No tasks"}
              </p>
            </div>
          ) : (
            column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onViewDetail={onViewDetail}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  );
}
