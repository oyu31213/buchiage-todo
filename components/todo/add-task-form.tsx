"use client";

import { useState, useTransition } from "react";
import { createTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Priority } from "@/components/todo/priority-badge";

// ネイティブの日付入力・優先度セレクトに付けるアンバー配色の共通スタイル。
const fieldClass =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AddTaskForm() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createTask({
        title,
        dueDate: dueDate || undefined,
        priority,
      });
      if (!result.ok) {
        // 未入力など。サーバの日本語メッセージをそのまま表示する。
        setError(result.error);
        return;
      }
      // 成功したら入力欄をリセット（優先度は既定の「中」に戻す）。
      setError(null);
      setTitle("");
      setDueDate("");
      setPriority("medium");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* タスク名（必須） */}
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="task-title">タスク名</Label>
          <Input
            id="task-title"
            data-testid="task-title-input"
            placeholder="やることを入力"
            value={title}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        {/* 期限（任意） */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-due">期限</Label>
          <input
            id="task-due"
            data-testid="task-due-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={fieldClass}
          />
        </div>

        {/* 優先度（任意・既定は中） */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-priority">優先度</Label>
          <select
            id="task-priority"
            data-testid="task-priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={cn(fieldClass, "pr-8")}
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <Button type="submit" data-testid="add-task-button" disabled={isPending}>
          {isPending ? "追加中…" : "追加"}
        </Button>
      </div>

      {error ? (
        <p
          data-testid="task-error"
          role="alert"
          className="mt-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
