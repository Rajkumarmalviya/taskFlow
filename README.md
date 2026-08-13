# TaskFlow

A lightweight task board for small teams — built as a full-stack take-home assignment.

---

## What it does

- View a Kanban board with columns (To Do, In Progress, Done) and their tasks
- Create, edit, and delete tasks (title required, description and priority optional)
- Move tasks between columns via **drag-and-drop** (dnd-kit) with live preview and optimistic updates
- Reorder tasks within a column by dragging
- Filter tasks by priority (Low / Medium / High)
- Search tasks by title in real time (debounced, hits the backend)
- All changes persist to a real SQLite database — page reload shows the same state
- Error states are surfaced in the UI; no blank screens or raw console errors

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS 4, TanStack Query v5, dnd-kit |
| Backend | Node.js + Express 5, TypeScript, better-sqlite3 |
| Database | SQLite (WAL mode) |
| Testing | Vitest + Supertest (backend) |

---

## Project structure

```
taskflow/
├── frontend/
│   └── src/
│       ├── features/
│       │   ├── board/        # Board, Column, TaskCard, toolbar, filters
│       │   └── tasks/        # TaskModal, TaskDetailModal
│       ├── hooks/            # useBoard, useTasks, useDebounce
│       ├── services/         # api.ts  (typed fetch wrapper)
│       ├── types/            # task.ts (shared domain types)
│       └── ui/               # Button, Input, Select, Modal, Badge
└── backend/
    └── src/
        ├── config/           # Environment config (PORT, DB_FILE, CORS_ORIGIN)
        ├── db/               # database.ts, schema.sql, seed.ts
        ├── middleware/       # errorHandler.ts (AppError), validate.ts
        ├── services/         # taskService.ts (all SQL queries)
        ├── controllers/      # boardController, taskController
        ├── routes/           # boardRoutes, taskRoutes
        ├── types/            # index.ts (domain interfaces)
        └── tests/            # task.test.ts (19 unit tests)
```

---

## Setup instructions

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd taskflow
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # optional — defaults work out of the box
npm run seed              # insert sample board + tasks
npm run dev               # starts on http://localhost:5000
```

The database (`backend/data/taskflow.db`) is created automatically on first run. No separate database process needed.

### 3. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Run backend tests

```bash
cd backend
npm test
```

All 19 tests should pass.

---

## Database schema

```sql
CREATE TABLE IF NOT EXISTS boards (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    name       TEXT     NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS columns (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    board_id   INTEGER  NOT NULL,
    name       TEXT     NOT NULL,
    position   INTEGER  NOT NULL,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);

CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    column_id   INTEGER  NOT NULL,
    title       TEXT     NOT NULL,
    description TEXT,
    priority    TEXT     NOT NULL DEFAULT 'MEDIUM',
    position    INTEGER  NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority  ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_position  ON tasks(column_id, position);
```

Full schema is in `backend/src/db/schema.sql`.

---

## Two non-trivial SQL queries

Both live in `backend/src/services/taskService.ts`.

**1. Task count per column on a board**

```sql
SELECT c.id, c.name, COUNT(t.id) AS task_count
FROM columns c
LEFT JOIN tasks t ON t.column_id = c.id
WHERE c.board_id = ?
GROUP BY c.id, c.name
ORDER BY c.position
```

Uses a LEFT JOIN so columns with zero tasks still appear. Groups and counts at the database level — no post-fetch filtering.

**2. Tasks with a given priority, newest first**

```sql
SELECT t.id, t.column_id, t.title, t.description, t.priority,
       t.position, t.created_at, t.updated_at
FROM tasks t
JOIN columns c ON t.column_id = c.id
WHERE c.board_id = ? AND t.priority = ?
ORDER BY t.created_at DESC
```

Joins through columns to scope by board, filters by priority at the SQL level, and sorts descending by creation date in the query itself.

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/boards/:boardId` | Full board with columns and tasks |
| GET | `/api/boards/:boardId/tasks` | Flat task list, supports `?priority=` and `?search=` |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:taskId` | Update task (partial) |
| DELETE | `/api/tasks/:taskId` | Delete task |
| PATCH | `/api/tasks/:taskId/move` | Move task to another column |
| PATCH | `/api/tasks/reorder` | Bulk-reorder tasks in a column |
| GET | `/api/tasks/by-priority` | Tasks by priority: `?boardId=&priority=` |

---

## Tests

19 tests in `backend/src/tests/task.test.ts`:

- Creating a task with an empty title fails (400)
- Creating a task with an invalid priority fails (400)
- Creating a task for a non-existent column fails (404)
- Moving a task updates its column correctly
- Moving a task to a non-existent column fails (404)
- Updating a task to have an empty title fails (400)
- Updating a non-existent task fails (404)
- Deleting an existing task succeeds
- Deleting a non-existent task fails (404)
- Reordering tasks within a column works
- Reordering with a non-existent column fails (404)
- `getTaskCountPerColumn` returns the correct count per column (hits DB directly)
- `getTaskCountPerColumn` total matches seeded task count
- `getTasksByPriority` returns only HIGH tasks
- `getTasksByPriority` returns only MEDIUM tasks
- `getTasksByPriority` returns empty array when no LOW tasks exist

---

## Decisions and assumptions

**Single board.** The assignment describes one board ("A Board contains Columns"). I hardcoded `BOARD_ID = 1` in the frontend and the seed creates exactly one board. Adding multi-board support would just mean a board-list screen and a route parameter.

**Drag-and-drop as the move mechanism.** The assignment said drag-and-drop is "nicer to see" but a working dropdown beats a broken drag. I had time to implement dnd-kit properly, so I went with that. Each card has a dedicated drag handle (the dot-grid icon) separate from the click area so accidental drags don't interfere with opening a task.

**Optimistic updates.** TanStack Query mutations update the cache immediately so the UI feels instant. On error, the cache rolls back to the previous state and the error banner appears.

**WAL mode on SQLite.** I enabled WAL journal mode (`PRAGMA journal_mode = WAL`) for better read concurrency and crash safety. The `.db-wal` and `.db-shm` sidecar files are in `.gitignore`.

**Validation at two layers.** The `validate()` middleware on Express routes catches bad input before it reaches the service. The service also validates for callers that bypass HTTP (e.g., tests calling service functions directly). Both throw `AppError` with a proper HTTP status code so the global error handler can format a consistent JSON response.

**`CORS_ORIGIN` defaults to `*`** in development. For a real deployment I would set `CORS_ORIGIN=https://myfrontend.com` in the server's environment.

**No ORM.** I wrote raw SQL with typed `better-sqlite3` prepared statements. The TypeScript generics (`db.prepare<Params, Row>`) mean TypeScript knows what shape comes back from each query without any magic.

**`position` column on tasks.** I store a numeric position so drag-and-drop order persists across page reloads. The reorder endpoint bulk-updates positions in a single SQLite transaction.

---

## What I'd improve with more time

- **Integration / HTTP tests** using Supertest against the real Express app — the current tests call service functions directly, which is fast but doesn't exercise route validation middleware.
- **Pagination** on the board endpoint — right now all tasks for a board load in one query, which is fine for small boards but would need limiting for larger ones.
- **Soft delete** instead of hard deletes, so accidental deletions can be undone.
- **Multi-board support** — a board-list home screen would be a small addition.
- **Deployment** — I would Dockerise both services and deploy to Railway or Fly.io with a single `docker-compose up`.

---

## Roughly how long

About **8–10 hours** across two sessions: schema + API first, then the React UI, then the audit/quality pass (typed errors, indexes, middleware validation, tests).

---

## One thing I found genuinely interesting

SQLite's `PRAGMA journal_mode = WAL` cannot be set inside a transaction — calling it via `db.exec()` (which wraps statements in an implicit transaction) silently does nothing. I discovered this when I had the PRAGMA in `schema.sql` and it had no effect on the journal mode. The fix was to call `db.pragma("journal_mode = WAL")` directly on the connection before running the schema, which executes outside any transaction context. It's a subtle behaviour difference between `db.pragma()` and `db.exec()` that isn't immediately obvious from the docs.
