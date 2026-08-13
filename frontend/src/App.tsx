import { useState } from "react";

import Board from "./components/Board/Board";
import BoardToolbar from "./components/BoardToolBar";
import TaskDetailModal from "./components/TaskDetailModal/TaskDetailModal";
import TaskModal from "./components/TaskModal/TaskModal";

import { useBoard } from "./hooks/useBoard";
import { useTasks } from "./hooks/useTasks";

import type {
  Priority,
  Task,
} from "./types/task";

function App() {
  const BOARD_ID = 1;

  // -----------------------------------------
  // Board/server state
  // -----------------------------------------

  const {
    board,
    isLoading,
    error: boardError,
    setError: setBoardError,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useBoard(BOARD_ID);

  // -----------------------------------------
  // Filtering/search state
  // -----------------------------------------

  const {
    priority,
    search,
    isFiltering,
    visibleBoard,
    changePriority,
    searchTasks,
    setSearch,
    error: taskError,
  } = useTasks(board);

  // -----------------------------------------
  // Modal/UI state
  // -----------------------------------------

  const [isCreating, setIsCreating] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [detailTask, setDetailTask] =
    useState<Task | null>(null);

  // -----------------------------------------
  // Derived error
  // -----------------------------------------

  const error =
    boardError || taskError;

  // -----------------------------------------
  // Loading state
  // -----------------------------------------

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="text-sm text-slate-500">
            Loading TaskFlow...
          </p>
        </div>
      </main>
    );
  }

  // -----------------------------------------
  // Board loading failure
  // -----------------------------------------

  if (!board) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Unable to load TaskFlow
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error ??
              "Something went wrong while loading the board."}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // -----------------------------------------
  // Modal handlers
  // -----------------------------------------

  function openCreateModal() {
    setBoardError(null);
    setIsCreating(true);
  }

  function openEditModal(task: Task) {
    setBoardError(null);
    setEditingTask(task);
  }

  function closeModal() {
    setIsCreating(false);
    setEditingTask(null);
  }

  // -----------------------------------------
  // Save task
  // -----------------------------------------

  async function handleSaveTask(data: {
    title: string;
    description: string;
    priority: Priority;
    columnId: number;
  }) {
    try {
      setBoardError(null);

      if (editingTask) {
        await updateTask(
          editingTask.id,
          {
            title: data.title,
            description: data.description,
            priority: data.priority,
          }
        );
      } else {
        await createTask({
          columnId: data.columnId,
          title: data.title,
          description: data.description,
          priority: data.priority,
        });
      }

      closeModal();
    } catch (error) {
      setBoardError(
        error instanceof Error
          ? error.message
          : "Failed to save task"
      );

      throw error;
    }
  }

  // -----------------------------------------
  // Delete task
  // -----------------------------------------

  async function handleDeleteTask(
    taskId: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setBoardError(null);

      await deleteTask(taskId);
    } catch (error) {
      setBoardError(
        error instanceof Error
          ? error.message
          : "Failed to delete task"
      );
    }
  }

  // -----------------------------------------
  // Move task
  // -----------------------------------------

  async function handleMoveTask(
    taskId: number,
    columnId: number
  ) {
    try {
      setBoardError(null);

      await moveTask(
        taskId,
        columnId
      );
    } catch (error) {
      setBoardError(
        error instanceof Error
          ? error.message
          : "Failed to move task"
      );
    }
  }

  // -----------------------------------------
  // Search
  // -----------------------------------------

  async function handleSearch(
    value: string
  ) {
    await searchTasks(value);
  }

  // -----------------------------------------
  // Column options
  // -----------------------------------------

  const columns = board.columns.map(
    (column) => ({
      id: column.id,
      name: column.name,
    })
  );

  const defaultColumnId =
    board.columns[0]?.id ?? 1;

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Toolbar */}
        <BoardToolbar
          boardName={"TaskFlow"}
          priority={priority}
          isFiltering={isFiltering}
          onPriorityChange={
            changePriority
          }
          onSearch={handleSearch}
          onCreate={openCreateModal}
        />

        {/* Global error */}
        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setBoardError(null);
              }}
              className="text-sm font-medium text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Board */}
        {visibleBoard && (
          <Board
            board={visibleBoard}
            onViewDetail={(task) => setDetailTask(task)}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onMove={handleMoveTask}
          />
        )}

        {/* Create/Edit modal */}
        {(isCreating || editingTask) && (
          <TaskModal
            task={editingTask}
            columns={columns}
            defaultColumnId={
              defaultColumnId
            }
            onClose={closeModal}
            onSave={handleSaveTask}
          />
        )}

        {/* Task detail modal */}
        {detailTask && (
          <TaskDetailModal
            task={detailTask}
            columnName={
              board.columns.find(
                (col) => col.id === detailTask.column_id
              )?.name ?? ""
            }
            onClose={() => setDetailTask(null)}
            onEdit={(task) => {
              setDetailTask(null);
              openEditModal(task);
            }}
          />
        )}

        {/* Task detail modal */}
        {detailTask && (
          <TaskDetailModal
            task={detailTask}
            columnName={
              board.columns.find(
                (col) => col.id === detailTask.column_id
              )?.name ?? ""
            }
            onClose={() => setDetailTask(null)}
            onEdit={(task) => {
              setDetailTask(null);
              openEditModal(task);
            }}
          />
        )}
      </div>
    </main>
  );
}

export default App;