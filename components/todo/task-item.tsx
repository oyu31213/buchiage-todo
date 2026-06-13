"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleTask, deleteTask } from "@/lib/actions/tasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PriorityBadge, type Priority } from "@/components/todo/priority-badge";
import { cn } from "@/lib/utils";

export type TaskItemProps = {
  id: string;
  title: string;
  dueDate: string | null;
  priority: Priority;
  completed: boolean;
};

// "2026-06-13" を "6月13日" に整形（タイムゾーンのズレを避けるため文字列のまま分解）。
function formatDue(due: string) {
  const [, month, day] = due.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

export function TaskItem({
  id,
  title,
  dueDate,
  priority,
  completed,
}: TaskItemProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <li
      data-testid="task-item"
      data-task-id={id}
      data-completed={completed}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-opacity",
        isPending && "opacity-60"
      )}
    >
      <Checkbox
        data-testid="task-checkbox"
        checked={completed}
        disabled={isPending}
        aria-label={completed ? "未完了に戻す" : "完了にする"}
        onCheckedChange={() => startTransition(() => toggleTask(id))}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          data-testid="task-title"
          className={cn(
            "truncate text-sm font-medium",
            completed
              ? "text-muted-foreground line-through"
              : "text-card-foreground"
          )}
        >
          {title}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {dueDate ? (
            <span
              data-testid="task-due"
              className="text-xs text-muted-foreground"
            >
              期限: {formatDue(dueDate)}
            </span>
          ) : null}
          <PriorityBadge priority={priority} />
        </div>
      </div>

      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        data-testid="task-delete"
        aria-label="削除"
        disabled={isPending}
        onClick={() => startTransition(() => deleteTask(id))}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
