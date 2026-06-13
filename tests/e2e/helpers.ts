import { expect, type Page } from "@playwright/test";

// 保存済みのログイン状態（storageState）を使うテストで参照する認証ファイル。
// 一度だけ手動ログインして作成する（README/手順参照）。
export const authFile = "tests/e2e/.auth/state.json";

// ログイン済み状態でタスク画面（/）を開く。
// 認証は storageState（保存済みクッキー）で済んでいる前提なので、ここではログイン操作はしない。
export async function openApp(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("todo-header")).toBeVisible({ timeout: 30_000 });
}

// 既存タスクをすべて削除して空状態にする（テスト間の独立性のため）。
export async function clearAllTasks(page: Page) {
  await page.goto("/");
  // 1件ずつ削除し、そのたびに件数が1減るのを確実に待つ。
  let count = await page.getByTestId("task-item").count();
  while (count > 0) {
    await page.getByTestId("task-delete").first().click();
    await expect(page.getByTestId("task-item")).toHaveCount(count - 1, {
      timeout: 10_000,
    });
    count -= 1;
  }
}

// 追加フォームでタスクを1件追加する。
// 連続追加で作成時刻が同時にならないよう、追加が一覧の先頭に反映されるまで待つ。
export async function addTask(
  page: Page,
  opts: { title: string; dueDate?: string; priority?: "high" | "medium" | "low" }
) {
  await page.getByTestId("task-title-input").fill(opts.title);
  if (opts.dueDate) await page.getByTestId("task-due-input").fill(opts.dueDate);
  if (opts.priority)
    await page.getByTestId("task-priority-select").selectOption(opts.priority);
  await page.getByTestId("add-task-button").click();
  // 追加したタスクが先頭に出るまで待つ（DB 反映 + 再検証の完了を保証）。
  await expect(page.getByTestId("task-title").first()).toHaveText(opts.title, {
    timeout: 10_000,
  });
}
