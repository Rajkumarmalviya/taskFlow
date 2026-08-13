import type {
  Board as BoardType,
  Task
} from "../../types/task";

import Column from "./Column";

interface BoardProps {
  board: BoardType;
  onViewDetail: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onMove: (
    taskId: number,
    columnId: number
  ) => void;
}

export default function Board({
  board,
  onViewDetail,
  onEdit,
  onDelete,
  onMove
}: BoardProps) {
  const columns = board.columns.map(
    ({ id, name }) => ({
      id,
      name
    })
  );
  return (
    <div className="board-scroll flex gap-4 md:grid md:grid-cols-3">
      {board.columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          columns={columns}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </div>
  );
}