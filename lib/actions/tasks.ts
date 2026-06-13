"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { createTaskSchema } from "@/lib/validations/task";

// ログイン中ユーザーのID。未ログインなら例外（middleware で保護済みだが二重チェック）。
async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("ログインが必要です");
  return userId;
}

// 本人のタスクを新しい順（createdAt 降順 = 追加したものが一番上）で取得。
export async function getTasks() {
  const userId = await requireUserId();
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
}

export type CreateTaskResult = { ok: true } | { ok: false; error: string };

// 追加。Zod 検証 → 失敗時は日本語メッセージを返す（未入力など）。
export async function createTask(input: {
  title: string;
  dueDate?: string;
  priority?: "high" | "medium" | "low";
}): Promise<CreateTaskResult> {
  const userId = await requireUserId();
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    const error = parsed.error.issues[0]?.message ?? "入力が正しくありません";
    return { ok: false, error };
  }
  const { title, dueDate, priority } = parsed.data;
  try {
    await db.insert(tasks).values({
      userId,
      title,
      dueDate: dueDate ?? null,
      priority,
    });
  } catch {
    // 想定外の DB エラーもクラッシュさせず {ok:false} に正規化する。
    return { ok: false, error: "追加に失敗しました。時間をおいて再度お試しください。" };
  }
  revalidatePath("/");
  return { ok: true };
}

// 完了 / 未完了をトグル（本人のものだけ）。
export async function toggleTask(id: string) {
  const userId = await requireUserId();
  const [current] = await db
    .select({ completed: tasks.completed })
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  if (!current) return;
  await db
    .update(tasks)
    .set({ completed: !current.completed })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  revalidatePath("/");
}

// 削除（本人のものだけ）。
export async function deleteTask(id: string) {
  const userId = await requireUserId();
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  revalidatePath("/");
}
