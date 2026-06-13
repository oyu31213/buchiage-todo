import { describe, it, expect } from "vitest";
import { createTaskSchema } from "@/lib/validations/task";

// 対象: lib/validations/task.ts（タスク追加の入力検証）
// 受け入れ条件: docs/requirements/todo.md「タスクの追加」節
describe("createTaskSchema", () => {
  // 受け入れ条件:「タスク名を入力して追加すると、タスクが追加される」
  it("タスク名だけ指定すれば通り、優先度は既定の中(medium)になる", () => {
    const result = createTaskSchema.safeParse({ title: "牛乳を買う" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("牛乳を買う");
      // 受け入れ条件:「優先度を指定せずに追加したタスクは『中』として表示される」
      expect(result.data.priority).toBe("medium");
      expect(result.data.dueDate).toBeUndefined();
    }
  });

  // 受け入れ条件:「タスク名が未入力のまま追加すると『タスクを入力してください』と表示され、追加されない」
  it("タスク名が空だと『タスクを入力してください』で弾かれる", () => {
    const result = createTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("タスクを入力してください");
    }
  });

  // 受け入れ条件と同じ趣旨: 空白だけのタスク名も未入力扱い（trim される）
  it("空白だけのタスク名も未入力として弾かれる", () => {
    const result = createTaskSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });

  // 受け入れ条件:「追加時に優先度（高/中/低）を指定すると、そのタスクに優先度が表示される」
  it("優先度を high/medium/low で指定できる", () => {
    for (const priority of ["high", "medium", "low"] as const) {
      const result = createTaskSchema.safeParse({ title: "タスク", priority });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.priority).toBe(priority);
    }
  });

  it("優先度に不正な値を渡すと弾かれる", () => {
    const result = createTaskSchema.safeParse({ title: "タスク", priority: "urgent" });
    expect(result.success).toBe(false);
  });

  // 受け入れ条件:「追加時に期限（締切日）を指定すると、そのタスクに期限が表示される」
  it("期限に YYYY-MM-DD 形式を指定できる", () => {
    const result = createTaskSchema.safeParse({ title: "タスク", dueDate: "2026-06-13" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.dueDate).toBe("2026-06-13");
  });

  // 堅牢性: Server Action は外部から直接呼べる入口なので不正な期限を弾く
  it("期限が日付でない文字列だと弾かれる", () => {
    const result = createTaskSchema.safeParse({ title: "タスク", dueDate: "あした" });
    expect(result.success).toBe(false);
  });

  it("期限が存在しない日付(2026-13-40)だと弾かれる", () => {
    const result = createTaskSchema.safeParse({ title: "タスク", dueDate: "2026-13-40" });
    expect(result.success).toBe(false);
  });
});
