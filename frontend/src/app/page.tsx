import Sidebar from "@/components/Sidebar";
import TodoWorkspace from "@/components/TodoWorkspace";

export default function Home() {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TodoWorkspace />
      </main>
    </div>
  );
}
