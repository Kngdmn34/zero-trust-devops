"use client";

import { useEffect, useState } from "react";
import type { Todo } from "@/lib/types";
import { isBackendConfigured } from "@/lib/api";

const STORAGE_KEY = "notion-todos";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export default function TodoWorkspace() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount (demo mode persistence).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTodos(JSON.parse(saved) as Todo[]);
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Persist to localStorage whenever todos change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // ignore storage errors
    }
  }, [todos]);

  function addTodo(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      { id: uid(), title: trimmed, done: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setInput("");
  }

  function toggle(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  async function aiBreakdown(id: string) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    setAiBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "breakdown", task: todo.title }),
      });
      const data = (await res.json()) as { subtasks?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error || "AI request failed");
      const subs = Array.isArray(data.subtasks) ? data.subtasks : [];
      const created: Todo[] = subs.map((title) => ({
        id: uid(),
        title,
        done: false,
        createdAt: new Date().toISOString(),
      }));
      setTodos((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        const next = [...prev];
        next.splice(idx + 1, 0, ...created);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setAiBusy(null);
    }
  }

  const remaining = todos.filter((t) => !t.done).length;
  const backend = isBackendConfigured();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-12">
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">My tasks</h1>
          <span
            className="rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-500"
            title={backend ? "Using the backend API" : "Using local demo storage"}
          >
            {backend ? "API" : "demo"}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {todos.length === 0
            ? "Add your first task below."
            : `${remaining} of ${todos.length} remaining`}
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo(input);
        }}
        className="mb-6 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a task and press Enter…"
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Add
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}

      <ul className="flex flex-col gap-0.5">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="group flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-black/[0.03]"
          >
            <button
              onClick={() => toggle(todo.id)}
              aria-label={todo.done ? "Mark as not done" : "Mark as done"}
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs ${
                todo.done
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-zinc-300"
              }`}
            >
              {todo.done ? "✓" : ""}
            </button>
            <span
              className={`flex-1 text-[15px] leading-6 ${
                todo.done ? "text-zinc-400 line-through" : ""
              }`}
            >
              {todo.title}
            </span>
            <button
              onClick={() => aiBreakdown(todo.id)}
              disabled={aiBusy === todo.id}
              className="invisible text-xs text-[var(--accent)] hover:underline disabled:opacity-50 group-hover:visible"
            >
              {aiBusy === todo.id ? "Thinking…" : "AI ⋯"}
            </button>
            <button
              onClick={() => remove(todo.id)}
              aria-label="Delete task"
              className="invisible text-zinc-400 hover:text-red-500 group-hover:visible"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="mt-10 text-center text-sm text-zinc-400">No tasks yet.</p>
      )}
    </div>
  );
}
