import { z } from "zod";

// タスク作成の入力検証。title 未入力は「タスクを入力してください」。
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "タスクを入力してください"),
  // 期限（任意）。UI は <input type="date"> なので YYYY-MM-DD。
  // Server Action は外部から直接呼べる入口なので、形式と実在日をここで検証する
  // （不正文字列が Postgres の date 型カラムに到達して実行時エラーになるのを防ぐ）。
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が正しくありません")
    .refine((s) => {
      // 存在しない日付（例: 2026-02-30 や 2026-13-40）を弾く。
      // new Date は不正な日付を繰り上げてしまうため、元の文字列に正確に戻るかで判定する。
      const d = new Date(`${s}T00:00:00Z`);
      return (
        !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
      );
    }, "正しい日付を入力してください")
    .optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
