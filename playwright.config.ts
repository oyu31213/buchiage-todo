import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

// .env.local（Clerk キー・DATABASE_URL・E2E 用テストユーザー情報）を読み込む。
// ${DB_PORT} などの参照も展開する。
expand(config({ path: ".env.local" }));

// E2E は受け入れ条件（docs/requirements/todo.md）を「実際のブラウザ操作」で検証する。
// 実行前提:
//   1) docker の PostgreSQL が起動し、マイグレーション適用済み（dev-server スキル参照）
//   2) .env.local に Clerk のキーが設定済み
//   3) 一度だけ手動ログインして tests/e2e/.auth/state.json を作成済み（手順は MANUAL/README 参照）。
//      ログイン状態が必要なテストは test.use({ storageState }) でこれを使う。
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000, // 初回コンパイルを見込んで延長
  fullyParallel: false,
  workers: 1, // タスクは DB 共有のため直列実行で状態を予測可能にする
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    // 起動確認はログイン不要で 200 を返す /sign-in を使う
    // （/ は未ログインだと認証リダイレクトになり readiness 判定で待ち続けるため）。
    url: "http://localhost:3000/sign-in",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
