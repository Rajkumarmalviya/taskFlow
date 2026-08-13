import type {
  Board,
  Task,
  Priority
} from "../types/task";

const API_URL =
  "http://localhost:5000/api";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_URL}${url}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      },
      ...options
    }
  );

  if (!response.ok) {
    const data = await response.json()
      .catch(() => null);

    throw new Error(
      data?.error ||
      "Something went wrong"
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function getBoard(
  boardId: number
) {
  return request<Board>(
    `/boards/${boardId}`
  );
}

export function createTask(data: {
  columnId: number;
  title: string;
  description?: string;
  priority?: Priority;
}) {
  return request<Task>(
    "/tasks",
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );
}

export function updateTask(
  taskId: number,
  data: {
    title?: string;
    description?: string;
    priority?: Priority;
  }
) {
  return request<Task>(
    `/tasks/${taskId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data)
    }
  );
}

export function deleteTask(
  taskId: number
) {
  return request<void>(
    `/tasks/${taskId}`,
    {
      method: "DELETE"
    }
  );
}

export function moveTask(
  taskId: number,
  columnId: number
) {
  return request<Task>(
    `/tasks/${taskId}/move`,
    {
      method: "PATCH",
      body: JSON.stringify({
        columnId
      })
    }
  );
}

export function getTasksByPriority(
  boardId: number,
  priority: Priority
) {
  return request<Task[]>(
    `/boards/${boardId}/tasks?priority=${priority}`
  );
}

export function getFilteredTasks(
  boardId: number,
  options?: {
    priority?: Priority;
    search?: string;
  }
) {
  const params = new URLSearchParams();

  if (options?.priority) {
    params.set(
      "priority",
      options.priority
    );
  }

  if (options?.search) {
    params.set(
      "search",
      options.search
    );
  }

  const query =
    params.toString();

  return request<Task[]>(
    `/boards/${boardId}/tasks${
      query ? `?${query}` : ""
    }`
  );
}