import { getTasks } from "@/lib/actions/tasks";
import { TodoHeader } from "@/components/todo/todo-header";
import { AddTaskForm } from "@/components/todo/add-task-form";
import { TaskList } from "@/components/todo/task-list";

// 本人のタスク一覧画面。未ログインは middleware.ts でサインインへ誘導される。
export default async function Home() {
  const tasks = await getTasks();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
      <div className="flex flex-col gap-6">
        <TodoHeader />
        <AddTaskForm />
        <TaskList tasks={tasks} />
      </div>
    </main>
  );
}
