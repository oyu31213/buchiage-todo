import { test, expect } from "@playwright/test";
import { openApp, authFile } from "./helpers";

// 受け入れ条件: docs/requirements/todo.md「ログイン」節（ログアウト）
//
// このテストは共有のログインセッションを無効化するため、ファイル名を "zz-" にして
// すべてのテストの最後に実行されるようにしている（他の認証テストへの巻き添えを防ぐ）。
test.use({ storageState: authFile });

// 条件:「ログアウトボタンを押すと未ログイン状態になり、タスク画面は見られなくなる」
test("ログアウトするとタスク画面が見られなくなる", async ({ page }) => {
  await openApp(page);
  await page.getByTestId("logout-button").click();
  // サインアウト後、自動で /sign-in へ遷移するのを待つ。
  await page.waitForURL(/sign-in/, { timeout: 15_000 });
  // 念のため / へ行ってもサインインへ戻される。
  await page.goto("/");
  await expect(page).toHaveURL(/sign-in/);
});
