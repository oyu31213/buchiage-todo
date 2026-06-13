import { test, expect } from "@playwright/test";
import { openApp, clearAllTasks, addTask, authFile } from "./helpers";

// 受け入れ条件: docs/requirements/todo.md「削除」節

// 保存済みのログイン状態を使う（手動ログインで作成した state.json）。
test.use({ storageState: authFile });

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await clearAllTasks(page);
});

// 条件:「タスクの削除ボタンを押すと、そのタスクが一覧から消える」
test("削除ボタンを押すとタスクが一覧から消える", async ({ page }) => {
  await addTask(page, { title: "消されるタスク" });
  await expect(page.getByTestId("task-item")).toHaveCount(1);
  await page.getByTestId("task-delete").first().click();
  await expect(page.getByTestId("task-item")).toHaveCount(0);
  await expect(page.getByTestId("empty-state")).toBeVisible();
});

// 条件:「削除した内容は、ページを再読み込みしても元に戻らない（消えたままになる）」
test("削除したタスクはリロードしても戻らない", async ({ page }) => {
  await addTask(page, { title: "完全に消すタスク" });
  await page.getByTestId("task-delete").first().click();
  await expect(page.getByTestId("task-item")).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("task-item")).toHaveCount(0);
});
