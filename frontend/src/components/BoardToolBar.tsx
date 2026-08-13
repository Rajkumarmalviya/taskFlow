import type { Priority } from "../types/task";
import PriorityFilter from "./PriorityFilter";

interface BoardToolbarProps {
  boardName: string;
  priority: Priority | "ALL";
  search: string;
  isFiltering: boolean;

  onPriorityChange: (
    value: Priority | "ALL"
  ) => void;

  onSearchChange: (
    value: string
  ) => void;

  onSearch: (
    value: string
  ) => void;

  onCreate: () => void;
}

function BoardToolbar({
  boardName,
  priority,
  search,
  isFiltering,
  onPriorityChange,
  onSearchChange,
  onSearch,
  onCreate,
}: BoardToolbarProps) {
  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    onSearch(search);
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
          <form
            onSubmit={handleSubmit}
            className="relative"
          >
            <input
              type="text"
              value={search}
              onChange={(event) =>
                onSearchChange(
                  event.target.value
                )
              }
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-56"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  onSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </form>

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