import { test, expect } from "@playwright/test";
import { openApp, clearAllTasks, addTask, authFile } from "./helpers";

// 受け入れ条件: docs/requirements/todo.md「タスクの追加」節

// 保存済みのログイン状態を使う（手動ログインで作成した state.json）。
test.use({ storageState: authFile });

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await clearAllTasks(page);
});

// 条件:「タスク名を入力して『追加』を押すと、入力したタスクが一覧の一番上に表示される」
test("タスクを追加すると一覧の先頭に表示される", async ({ page }) => {
  await addTask(page, { title: "最初のタスク" });
  await addTask(page, { title: "最新のタスク" });
  // 先頭の行が最後に追加したものになっている。
  await expect(page.getByTestId("task-title").first()).toHaveText("最新のタスク");
});

// 条件:「追加時に期限（締切日）を指定すると、そのタスクに期限が表示される」
test("期限を指定するとタスクに期限が表示される", async ({ page }) => {
  await addTask(page, { title: "期限つきタスク", dueDate: "2026-12-25" });
  const item = page.getByTestId("task-item").first();
  await expect(item.getByTestId("task-due")).toContainText("12月25日");
});

// 条件:「追加時に優先度（高/中/低）を指定すると、そのタスクに優先度が表示される」
test("優先度『高』を指定するとそのタスクに高が表示される", async ({ page }) => {
  await addTask(page, { title: "重要タスク", priority: "high" });
  const badge = page.getByTestId("task-item").first().getByTestId("priority-badge");
  await expect(badge).toHaveAttribute("data-priority", "high");
});

// 条件:「優先度を指定せずに追加したタスクは『中』として表示される」
test("優先度を指定しないと『中』として表示される", async ({ page }) => {
  await addTask(page, { title: "ふつうのタスク" });
  const badge = page.getByTestId("task-item").first().getByTestId("priority-badge");
  await expect(badge).toHaveAttribute("data-priority", "medium");
});

// 条件:「タスク名が未入力のまま『追加』を押すと『タスクを入力してください』と表示され、追加されない」
test("タスク名未入力で追加するとエラーが出て追加されない", async ({ page }) => {
  await page.getByTestId("add-task-button").click();
  await expect(page.getByTestId("task-error")).toHaveText("タスクを入力してください");
  // 入力枠が赤く（aria-invalid）なる。
  await expect(page.getByTestId("task-title-input")).toHaveAttribute("aria-invalid", "true");
  // タスクは増えていない（空状態のまま）。
  await expect(page.getByTestId("task-item")).toHaveCount(0);
});

// 条件:「追加した内容は、ページを再読み込みしても消えずに残っている」
test("追加したタスクはリロードしても残る", async ({ page }) => {
  await addTask(page, { title: "保存されるタスク" });
  await expect(page.getByTestId("task-title").first()).toHaveText("保存されるタスク");
  await page.reload();
  await expect(page.getByTestId("task-title").first()).toHaveText("保存されるタスク");
});
