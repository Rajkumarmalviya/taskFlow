import {
  useEffect,
  useState,
} from "react";

import {
  getFilteredTasks,
} from "../services/api";

import type {
  Board,
  Priority,
  Task,
} from "../types/task";

export function useTasks(
  board: Board | null
) {
  const [priority, setPriority] =
    useState<Priority | "ALL">("ALL");

  const [search, setSearch] =
    useState("");

  const [filteredTasks, setFilteredTasks] =
    useState<Task[] | null>(null);

  const [isFiltering, setIsFiltering] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    setPriority("ALL");
    setSearch("");
    setFilteredTasks(null);
  }, [board?.id]);

  async function applyFilters(
    nextPriority: Priority | "ALL",
    nextSearch: string
  ) {
    if (!board) {
      return;
    }

    if (
      nextPriority === "ALL" &&
      !nextSearch.trim()
    ) {
      setFilteredTasks(null);
      return;
    }

    try {
      setIsFiltering(true);
      setError(null);

      const tasks =
        await getFilteredTasks(
          board.id,
          {
            priority:
              nextPriority === "ALL"
                ? undefined
                : nextPriority,

            search:
              nextSearch.trim() ||
              undefined,
          }
        );

      setFilteredTasks(tasks);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to filter tasks"
      );
    } finally {
      setIsFiltering(false);
    }
  }

  async function changePriority(
    value: Priority | "ALL"
  ) {
    setPriority(value);

    await applyFilters(
      value,
      search
    );
  }

  async function searchTasks(
    value: string
  ) {
    setSearch(value);

    await applyFilters(
      priority,
      value
    );
  }

  const visibleBoard =
    !board
      ? null
      : filteredTasks === null
        ? board
        : {
            ...board,

            columns:
              board.columns.map(
                (column) => ({
                  ...column,

                  tasks:
                    filteredTasks.filter(
                      (task) =>
                        task.column_id ===
                        column.id
                    ),
                })
              ),
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