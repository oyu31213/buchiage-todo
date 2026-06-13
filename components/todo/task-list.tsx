import { TaskItem } from "@/components/todo/task-item";
import type { Task } from "@/lib/db/schema";

export function TaskList({ tasks }: { tasks: Task[] }) {
  // 0 件のときは空状態を表示（受け入れ条件: 「まだタスクがありません」）。
  if (tasks.length === 0) {
    return (
      <div
        data-testid="empty-state"
        className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-12 text-center text-sm text-muted-foreground"
      >
        まだタスクがありません
      </div>
    );
  }

  return (
    <ul data-testid="task-list" className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          id={task.id}
          title={task.title}
          dueDate={task.dueDate}
          priority={task.priority}
          completed={task.completed}
        />
      ))}
    </ul>
  );
}
