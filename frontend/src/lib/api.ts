// Backend REST client for the Tasks API.
//
// Used in production once NEXT_PUBLIC_API_URL is set (the backend service
// built by the backend team). When it is empty the UI runs in local demo
// mode (browser localStorage), so the frontend builds and runs standalone.

import type { Todo } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** True when a backend API URL is configured for this build. */
export function isBackendConfigured(): boolean {
  return Boolean(API_URL);
}

export async function fetchTodos(): Promise<Todo[]> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL not set");
  const res = await fetch(`${API_URL}/todos`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch todos: ${res.status}`);
  return (await res.json()) as Todo[];
}

export async function createTodo(title: string): Promise<Todo> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL not set");
  const res = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Failed to create todo: ${res.status}`);
  return (await res.json()) as Todo;
}

export async function updateTodo(id: string, patch: Partial<Todo>): Promise<Todo> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL not set");
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Failed to update todo: ${res.status}`);
  return (await res.json()) as Todo;
}

export async function deleteTodo(id: string): Promise<void> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL not set");
  const res = await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete todo: ${res.status}`);
}
