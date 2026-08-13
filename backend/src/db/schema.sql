-- Note: PRAGMA foreign_keys and journal_mode are set programmatically
-- in database.ts via db.pragma(). They must not appear here because
-- db.exec() runs them inside an implicit transaction where PRAGMAs
-- that affect the connection (like journal_mode) are silently ignored.

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

    FOREIGN KEY (board_id)
        REFERENCES boards(id)
        ON DELETE CASCADE
);

-- Index used by: getBoardById, getFilteredTasks, getTaskCountPerColumn, etc.
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

    FOREIGN KEY (column_id)
        REFERENCES columns(id)
        ON DELETE CASCADE
);

-- Index used by every query that joins or filters tasks by column
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);

-- Index used by getTasksByPriority and getFilteredTasks
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Index used by ORDER BY position in getBoardById / reorderTasks
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(column_id, position);
