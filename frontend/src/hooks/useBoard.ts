import { useCallback, useEffect, useState } from "react";

import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getBoard,
  moveTask as moveTaskApi,
  updateTask as updateTaskApi,
} from "../services/api";

import type {
  Board,
  Priority,
  Task,
} from "../types/task";

interface CreateTaskInput {
  columnId: number;
  title: string;
  description?: string;
  priority?: Priority;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
}

export function useBoard(boardId: number) {
  const [board, setBoard] =
    useState<Board | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadBoard = useCallback(
    async () => {
      try {
        setError(null);

        const data =
          await getBoard(boardId);

        setBoard(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load board"
        );
      }
    },
    [boardId]
  );

  useEffect(() => {
    async function initialize() {
      setIsLoading(true);

      await loadBoard();

      setIsLoading(false);
    }

    initialize();
  }, [loadBoard]);

  const createTask = async (
    data: CreateTaskInput
  ) => {
    await createTaskApi(data);
    await loadBoard();
  };

  const updateTask = async (
    taskId: number,
    data: UpdateTaskInput
  ) => {
    await updateTaskApi(
      taskId,
      data
    );

    await loadBoard();
  };

  const deleteTask = async (
    taskId: number
  ) => {
    await deleteTaskApi(taskId);
    await loadBoard();
  };

  const moveTask = async (
    taskId: number,
    columnId: number
  ) => {
    await moveTaskApi(
      taskId,
      columnId
    );

    await loadBoard();
  };

  return {
    board,
    isLoading,
    error,
    setError,
    loadBoard,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}