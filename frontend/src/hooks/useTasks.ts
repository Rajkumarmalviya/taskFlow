import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getFilteredTasks } from "../services/api";
import type { Board, Priority, Task } from "../types/task";

export function useTasks(board: Board | null) {
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    setPriority("ALL");
    setSearch("");
  }, [board?.id]);

  const enabled = !!board && (priority !== "ALL" || search.trim() !== "");

  const queryKey = ["filteredTasks", board?.id ?? "", priority, search.trim()];

  const query = useQuery<Task[], Error>({
    queryKey,
    queryFn: () =>
      getFilteredTasks(board!.id, {
        priority: priority === "ALL" ? undefined : priority,
        search: search.trim() || undefined,
      }),
    enabled,
    retry: 1,
  });

  const filteredTasks = query.data ?? null;
  const isFiltering = query.isFetching;
  const error = query.error ? (query.error instanceof Error ? query.error.message : String(query.error)) : null;

  async function changePriority(value: Priority | "ALL") {
    setPriority(value);

    if (!board) return;

    if (value === "ALL" && !search.trim()) {
      // no filter — ensure no cached filtered tasks
      return;
    }

    await queryClient.fetchQuery({
      queryKey: ["filteredTasks", board.id, value, search.trim()],
      queryFn: () =>
        getFilteredTasks(board.id, {
          priority: value === "ALL" ? undefined : value,
          search: search.trim() || undefined,
        }),
    });
  }

  async function searchTasks(value: string) {
    setSearch(value);

    if (!board) return;

    if (priority === "ALL" && !value.trim()) {
      // no filter
      return;
    }

    await queryClient.fetchQuery({
      queryKey: ["filteredTasks", board.id, priority, value.trim()],
      queryFn: () =>
        getFilteredTasks(board.id, {
          priority: priority === "ALL" ? undefined : priority,
          search: value.trim() || undefined,
        }),
    });
  }

  const visibleBoard =
    !board
      ? null
      : filteredTasks === null
      ? board
      : {
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            tasks: filteredTasks.filter((task) => task.column_id === column.id),
          })),
        };

  return {
    priority,
    search,
    isFiltering,
    error,
    visibleBoard,
    changePriority,
    searchTasks,
    setSearch,
  };
}