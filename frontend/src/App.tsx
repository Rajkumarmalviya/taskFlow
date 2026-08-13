import {
  useEffect,
  useState
} from "react";

import Board from "./components/Board";
import PriorityFilter from "./components/PriorityFilter";
import TaskModal from "./components/TaskModal";

import {
  createTask,
  deleteTask,
  getBoard,
  moveTask,
  updateTask,
  getTasksByPriority,
  getFilteredTasks
} from "./services/api";

import type {
  Board as BoardType,
  Priority,
  Task
} from "./types/task";

function App() {
  const [search, setSearch] =
  useState("");
  const [board, setBoard] =
    useState<BoardType | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [priority, setPriority] =
    useState<Priority | "ALL">("ALL");

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [isCreating, setIsCreating] =
    useState(false);

    const [filteredTasks, setFilteredTasks] =
  useState<Task[] | null>(null);


  async function loadBoard() {
  try {
    setLoading(true);
    setError(null);

    const data = await getBoard(1);

    setBoard(data);
    setFilteredTasks(null);
    setPriority("ALL");
  } catch (error) {
    setError("Failed to load board");
    
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadBoard();
  }, []);

  async function handleDelete(
  taskId: number
) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setError(null);

    await deleteTask(taskId);

    await loadBoard();
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to delete task"
    );
  }
}

async function handlePriorityChange(
  value: Priority | "ALL"
) {
  try {
    setError(null);
    setPriority(value);

    if (value === "ALL") {
      setFilteredTasks(null);
      return;
    }

    const tasks =
      await getTasksByPriority(
        board!.id,
        value
      );

    setFilteredTasks(tasks);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to filter tasks"
    );
  }
}
  async function handleMove(
    taskId: number,
    columnId: number
  ) {
    try {
      setError(null);

      await moveTask(
        taskId,
        columnId
      );

      await loadBoard();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to move task"
      );
    }
  }

  async function handleSearch() {
  try {
    setError(null);

    const tasks =
      await getFilteredTasks(
        board!.id,
        {
          priority:
            priority === "ALL"
              ? undefined
              : priority,
          search: search.trim() || undefined
        }
      );

    setFilteredTasks(tasks);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to search tasks"
    );
  }
}
  async function handleSaveTask(data: {
    title: string;
    description: string;
    priority: Priority;
    columnId: number;
  }) {
    if (editingTask) {
      await updateTask(
        editingTask.id,
        {
          title: data.title,
          description: data.description,
          priority: data.priority
        }
      );

      setEditingTask(null);
    } else {
      await createTask({
        columnId: data.columnId,
        title: data.title,
        description: data.description,
        priority: data.priority
      });

      setIsCreating(false);
    }

    await loadBoard();
  }

  function openCreateModal() {
    setError(null);
    setIsCreating(true);
  }

  function openEditModal(task: Task) {
    setError(null);
    setEditingTask(task);
  }

  function closeModal() {
    setIsCreating(false);
    setEditingTask(null);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">
          Loading TaskFlow...
        </p>
      </main>
    );
  }

  if (error && !board) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p>{error}</p>

          <button
            onClick={loadBoard}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!board) {
    return null;
  }

  const filteredBoard =
  filteredTasks === null
    ? board
    : {
        ...board,
        columns: board.columns.map(
          (column) => ({
            ...column,
            tasks: filteredTasks.filter(
              (task) =>
                task.column_id === column.id
            )
          })
        )
      };

  const columns = board.columns.map(
    ({ id, name }) => ({
      id,
      name
    })
  );

  const firstColumnId =
    board.columns[0]?.id ?? 1;

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {board.name}
            </h1>

            <p className="mt-1 text-slate-500">
              Simple task management for small teams.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
  value={search}
  onChange={(event) =>
    setSearch(event.target.value)
  }
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  }}
  placeholder="Search tasks..."
  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
/>
           <PriorityFilter
  value={priority}
  onChange={handlePriorityChange}
/>

            <button
              onClick={openCreateModal}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              + New task
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Board
          board={filteredBoard}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      </div>

      {(isCreating || editingTask) && (
        <TaskModal
          task={editingTask}
          columns={columns}
          defaultColumnId={firstColumnId}
          onClose={closeModal}
          onSave={handleSaveTask}
        />
      )}
    </main>
  );
}

export default App;