// Presentational, server-rendered sidebar (Notion-inspired).

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200/70 bg-[var(--sidebar)] px-3 py-5 sm:flex">
      <div className="flex items-center gap-2 px-2">
        <span className="text-base text-[var(--accent)]">✦</span>
        <span className="font-semibold tracking-tight">Tasks</span>
      </div>

      <nav className="mt-6 flex flex-col gap-0.5 text-sm">
        <div className="rounded-md bg-black/[0.04] px-2 py-1.5 font-medium">
          My tasks
        </div>
        <div className="px-2 py-1.5 text-zinc-500">Archive</div>
        <div className="px-2 py-1.5 text-zinc-500">Settings</div>
      </nav>

      <div className="mt-auto px-2 text-xs text-zinc-400">
        AI task breakdown · Groq
      </div>
    </aside>
  );
}
