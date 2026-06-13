import { test, expect } from "@playwright/test";
import { openApp, clearAllTasks, addTask, authFile } from "./helpers";

// 受け入れ条件: docs/requirements/todo.md「完了チェック」節

// 保存済みのログイン状態を使う（手動ログインで作成した state.json）。
test.use({ storageState: authFile });

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await clearAllTasks(page);
  await addTask(page, { title: "完了テスト用タスク" });
});

// 条件:「チェックを押すと、そのタスクが『完了』の見た目に変わる」
test("チェックすると完了の見た目（取り消し線）になる", async ({ page }) => {
  const item = page.getByTestId("task-item").first();
  await item.getByTestId("task-checkbox").click();
  await expect(item).toHaveAttribute("data-completed", "true");
  // タイトルに取り消し線（line-through）が付く。
  await expect(item.getByTestId("task-title")).toHaveClass(/line-through/);
});

// 条件:「完了済みタスクのチェックをもう一度押すと、『未完了』の見た目に戻る」
test("もう一度チェックすると未完了に戻る", async ({ page }) => {
  const item = page.getByTestId("task-item").first();
  const checkbox = item.getByTestId("task-checkbox");
  await checkbox.click();
  await expect(item).toHaveAttribute("data-completed", "true");
  await checkbox.click();
  await expect(item).toHaveAttribute("data-completed", "false");
});

// 条件:「完了/未完了の状態は、ページを再読み込みしても保持されている」
test("完了状態はリロードしても保持される", async ({ page }) => {
  const item = page.getByTestId("task-item").first();
  await item.getByTestId("task-checkbox").click();
  await expect(item).toHaveAttribute("data-completed", "true");
  await page.reload();
  await expect(page.getByTestId("task-item").first()).toHaveAttribute(
    "data-completed",
    "true"
  );
});

// 条件:「完了にしたタスクも一覧から消えず、そのまま表示され続ける」
test("完了にしてもタスクは一覧に残る", async ({ page }) => {
  const item = page.getByTestId("task-item").first();
  await item.getByTestId("task-checkbox").click();
  await expect(item).toHaveAttribute("data-completed", "true");
  // 一覧から消えていない。
  await expect(page.getByTestId("task-item")).toHaveCount(1);
  await expect(page.getByTestId("task-title").first()).toHaveText("完了テスト用タスク");
});
