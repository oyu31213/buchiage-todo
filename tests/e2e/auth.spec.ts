import { test, expect } from "@playwright/test";
import { openApp, authFile } from "./helpers";

// 受け入れ条件: docs/requirements/todo.md「ログイン」節

// --- 未ログイン状態で確認するテスト（storageState なし）---
test.describe("ログイン（未ログイン状態）", () => {
  // 条件:「未ログインの状態でタスク画面を開こうとすると、ログイン画面に移動する」
  test("未ログインで / を開くとサインインへリダイレクトされる", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/sign-in/);
  });

  // 条件:「ログイン画面に『Google でログイン』ボタンが表示される」
  test("サインイン画面に Google ログインのボタンが表示される", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(
      page.getByRole("button", { name: /google/i }).first()
    ).toBeVisible();
  });

  // 条件:「『Google でログイン』を押すと Google のログイン画面に進み、許可するとログインできる」
  // → 外部の Google 認証画面を伴うため自動化は不安定。人手で最終確認する（MANUAL.md）。
  test.skip("Google ログインで実際にサインインできる（手動確認）", async () => {});
});

// --- ログイン済み状態で確認するテスト（保存済み storageState を使う）---
test.describe("ログイン（ログイン済み状態）", () => {
  test.use({ storageState: authFile });

  // 条件:「ログインに成功すると、自分のタスク一覧画面が表示される」
  test("ログイン済みならタスク一覧画面が表示される", async ({ page }) => {
    await openApp(page);
    await expect(page.getByTestId("add-task-button")).toBeVisible();
  });

  // ※「ログアウト」の受け入れ条件は zz-logout.spec.ts で検証する。
  //   （ログアウトは共有セッションを無効化するため、全テストの最後に実行する必要がある）

  // 条件:「別のユーザーでログインすると、そのユーザー自身のタスクだけが表示される」
  // → 2 ユーザー分のテスト資格情報が必要。テストユーザーを2つ用意できる場合に有効化する。
  test.skip("別ユーザーには他人のタスクが表示されない（要・第2テストユーザー）", async () => {});
});
