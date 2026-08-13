import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getBoard,
  moveTask as moveTaskApi,
  updateTask as updateTaskApi,
} from "../services/api";

import type { Board, Priority, Task } from "../types/task";

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
  const queryClient = useQueryClient();

  const {
    data: board,
    isLoading,
    error,
    refetch,
  } = useQuery<Board, Error>({
    queryKey: ["board", boardId],
    queryFn: () => getBoard(boardId),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskInput) => createTaskApi(data),
    onSuccess: (createdTask: Task) => {
      queryClient.setQueryData<Board>(["board", boardId], (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === createdTask.column_id
              ? { ...col, tasks: [...col.tasks, createdTask] }
              : col
          ),
        } as Board;
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: UpdateTaskInput }) =>
      updateTaskApi(taskId, data),
    onSuccess: (updatedTask: Task) => {
      queryClient.setQueryData<Board>(["board", boardId], (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
          })),
        } as Board;
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => deleteTaskApi(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.setQueryData<Board>(["board", boardId], (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          })),
        } as Board;
      });
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, columnId }: { taskId: number; columnId: number }) =>
      moveTaskApi(taskId, columnId),
    // optimistic update handled in onMutate
    async onMutate({ taskId, columnId }: { taskId: number; columnId: number }) {
      const prev = queryClient.getQueryData<Board>(["board", boardId]);
      if (!prev) return { prev: undefined };

      let fromColumnId: number | null = null;
      let taskSnapshot: Task | null = null;

      for (const col of prev.columns) {
        const found = col.tasks.find((t) => t.id === taskId);
        if (found) {
          fromColumnId = col.id;
          taskSnapshot = found;
          break;
        }
      }

      if (!taskSnapshot || fromColumnId === columnId) return { prev };

      const next: Board = {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === fromColumnId) return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
          if (col.id === columnId) return { ...col, tasks: [...col.tasks, { ...taskSnapshot!, column_id: columnId }] };
          return col;
        }),
      };

      queryClient.setQueryData<Board>(["board", boardId], next);

      return { prev };
    },
    onError(_err: unknown, _vars: { taskId: number; columnId: number }, context?: { prev?: Board }) {
      if (context?.prev) queryClient.setQueryData<Board>(["board", boardId], context.prev);
    },
    onSuccess: (movedTask: Task) => {
      // reconcile with server response
      queryClient.setQueryData<Board>(["board", boardId], (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) => (t.id === movedTask.id ? movedTask : t)),
          })),
        } as Board;
      });
    },
  });

  // Optimistic move: update cache immediately, rollback on error
  async function optimisticMoveTask(taskId: number, toColumnId: number) {
    const prev = queryClient.getQueryData<Board>(["board", boardId]);
    if (!prev) return;

    // find task and source column
    let fromColumnId: number | null = null;
    let taskSnapshot: Task | null = null;

    for (const col of prev.columns) {
      const found = col.tasks.find((t) => t.id === taskId);
      if (found) {
        fromColumnId = col.id;
        taskSnapshot = found;
        break;
      }
    }

    if (!taskSnapshot || fromColumnId === toColumnId) return;

    const next: Board = {
      ...prev,
      columns: prev.columns.map((col) => {
        if (col.id === fromColumnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
        }

        if (col.id === toColumnId) {
          return { ...col, tasks: [...col.tasks, { ...taskSnapshot, column_id: toColumnId }] };
        }

        return col;
      }),
    };

    queryClient.setQueryData<Board>(["board", boardId], next);

    try {
      await moveTaskApi(taskId, toColumnId);
      await queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    } catch (err) {
      queryClient.setQueryData(["board", boardId], prev);
      throw err;
    }
  }

  return {
    board: (board ?? null) as Board | null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    setError: (() => {}) as unknown as (v: string | null) => void,
    loadBoard: refetch,
    createTask: (data: CreateTaskInput) => createTaskMutation.mutateAsync(data),
    updateTask: (taskId: number, data: UpdateTaskInput) =>
      updateTaskMutation.mutateAsync({ taskId, data }),
    deleteTask: (taskId: number) => deleteTaskMutation.mutateAsync(taskId),
    moveTask: (taskId: number, columnId: number) => moveTaskMutation.mutateAsync({ taskId, columnId }),
    optimisticMoveTask,
  };
}