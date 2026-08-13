import { useEffect, useState } from "react";

import type { Priority } from "../types/task";
import { useDebounce } from "../hooks/useDebounce";
import PriorityFilter from "./PriorityFilter";

interface BoardToolbarProps {
  boardName: string;
  priority: Priority | "ALL";
  isFiltering: boolean;

  onPriorityChange: (
    value: Priority | "ALL"
  ) => void;

  onSearch: (value: string) => void;

  onCreate: () => void;
}

function BoardToolbar({
  boardName,
  priority,
  isFiltering,
  onPriorityChange,
  onSearch,
  onCreate,
}: BoardToolbarProps) {
  const [inputValue, setInputValue] =
    useState("");

  const debouncedSearch =
    useDebounce(inputValue, 400);

  // Fire search whenever the debounced value settles
  useEffect(() => {
    onSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleClear() {
    setInputValue("");
    // Immediately clear results without waiting for debounce
    onSearch("");
  }

  return (
    <header className="mb-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {/* Board information */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {boardName}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and organize your team's tasks.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            {/* Search icon */}
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            </span>

            <input
              type="text"
              value={inputValue}
              onChange={(event) =>
                setInputValue(event.target.value)
              }
              placeholder="Search tasks..."
              aria-label="Search tasks"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-56"
            />

            {/* Clear button — shown while typing */}
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                ×
              </button>
            )}

            {/* Subtle spinner while debounce is pending (input differs from settled value) */}
            {inputValue !== debouncedSearch && (
              <span
                aria-hidden="true"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <svg
                  className="h-3.5 w-3.5 animate-spin text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </span>
            )}
          </div>

          {/* Priority filter */}
          <div className="relative">
            <PriorityFilter
              value={priority}
              onChange={onPriorityChange}
            />

            {isFiltering && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-medium text-white">
                …
              </span>
            )}
          </div>

          {/* Create task */}
          <button
            type="button"
            onClick={onCreate}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 active:scale-[0.98]"
          >
            + New Task
          </button>
        </div>
      </div>
    </header>
  );
}

export default BoardToolbar;
