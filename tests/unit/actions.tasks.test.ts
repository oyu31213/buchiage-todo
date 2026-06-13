import { describe, it, expect, beforeEach, vi } from "vitest";

// 対象: lib/actions/tasks.ts（Server Actions）
// DB と Clerk 認証はモックし、アクションの「ロジック」だけを検証する。
// UI の振る舞い（実際の追加・完了・削除）は E2E（tests/e2e/）で担保する。

// vi.hoisted で、モックから参照できる可変ステートを用意する。
const { state } = vi.hoisted(() => ({
  state: {
    userId: "user_1" as string | null,
    inserted: [] as Array<Record<string, unknown>>,
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: state.userId }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: () => {},
}));

// db.insert(...).values(...) の呼び出しを記録するだけの軽いモック。
vi.mock("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: async (values: Record<string, unknown>) => {
        state.inserted.push(values);
      },
    }),
  },
}));

import { createTask, getTasks, toggleTask, deleteTask } from "@/lib/actions/tasks";

beforeEach(() => {
  state.userId = "user_1";
  state.inserted = [];
});

describe("createTask", () => {
  // 受け入れ条件:「タスク名を入力して追加すると、タスクが追加される」
  it("正しい入力なら ok:true を返し、本人の userId 付きで挿入する", async () => {
    const result = await createTask({ title: "牛乳を買う", priority: "high" });
    expect(result).toEqual({ ok: true });
    expect(state.inserted).toHaveLength(1);
    expect(state.inserted[0]).toMatchObject({
      userId: "user_1",
      title: "牛乳を買う",
      priority: "high",
    });
  });

  // 受け入れ条件:「優先度を指定せずに追加したタスクは『中』として表示される」
  it("優先度・期限を省略すると priority=medium・dueDate=null で挿入する", async () => {
    const result = await createTask({ title: "タスク" });
    expect(result).toEqual({ ok: true });
    expect(state.inserted[0]).toMatchObject({ priority: "medium", dueDate: null });
  });

  // 受け入れ条件:「タスク名が未入力のまま追加すると『タスクを入力してください』と表示され、追加されない」
  it("タスク名が空なら ok:false を返し、挿入しない", async () => {
    const result = await createTask({ title: "" });
    expect(result).toEqual({ ok: false, error: "タスクを入力してください" });
    expect(state.inserted).toHaveLength(0);
  });

  // 堅牢性: 不正な期限は入口で弾き、DB に到達させない
  it("不正な期限文字列なら ok:false を返し、挿入しない", async () => {
    const result = await createTask({ title: "タスク", dueDate: "あした" });
    expect(result.ok).toBe(false);
    expect(state.inserted).toHaveLength(0);
  });

  // 受け入れ条件:「未ログインの状態ではタスクを扱えない」（二重チェック）
  it("未ログインなら例外を投げる（挿入もしない）", async () => {
    state.userId = null;
    await expect(createTask({ title: "タスク" })).rejects.toThrow("ログインが必要です");
    expect(state.inserted).toHaveLength(0);
  });
});

// 受け入れ条件:「未ログインでタスク画面を開こうとするとログイン画面へ」＋
//「他人のタスクは見えない」を支える認証ガードの検証。
// （実際のユーザー分離・一覧表示は E2E で担保する）
describe("認証ガード", () => {
  it("getTasks は未ログインだと例外を投げる", async () => {
    state.userId = null;
    await expect(getTasks()).rejects.toThrow("ログインが必要です");
  });

  it("toggleTask は未ログインだと例外を投げる", async () => {
    state.userId = null;
    await expect(toggleTask("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      "ログインが必要です"
    );
  });

  it("deleteTask は未ログインだと例外を投げる", async () => {
    state.userId = null;
    await expect(deleteTask("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      "ログインが必要です"
    );
  });
});
