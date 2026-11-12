// Shared types for the Tasks frontend.

export interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

/** Response shape from the AI breakdown endpoint. */
export interface AIBreakdownResponse {
  subtasks: string[];
}
