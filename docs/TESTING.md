# テストの実行手順

受け入れ条件（`docs/requirements/todo.md`）を裏付けるテストの動かし方。

> **pnpm の注意**: この環境では `pnpm` のパスが通っていないことがある。
> ターミナルで動かないときは、コマンドの先頭に次を付ける:
> `export PATH="$HOME/.npm-global/bin:$PATH"; pnpm ...`

## 1. unit テスト（Vitest）

バックエンドのロジック（Zod 検証・Server Actions）を検証する。DB も Clerk も不要。

```bash
pnpm test:unit
```

## 2. E2E テスト（Playwright）

実ブラウザで「追加・完了・削除・ログイン」を検証する。事前準備が必要。

### 事前準備（初回のみ）
1. **DB を起動してマイグレーション**
   ```bash
   docker compose up -d
   pnpm drizzle-kit migrate
   ```
2. **`.env.local` を用意**（`.env.example` をコピーし、Clerk のキーと DB 設定を記入）
3. **E2E 用のテストユーザー**を Clerk に作成
   - メールは `+clerk_test` 付き（例: `あなた+clerk_test@gmail.com`）にすると確認コードが `424242` 固定になる
   - `.env.local` に `E2E_CLERK_USER_USERNAME` / `E2E_CLERK_USER_PASSWORD` を記入
4. **ログイン状態を保存**（OTP 自動入力を避けるため、一度だけ手動でログインして状態を保存する）
   ```bash
   # 先に pnpm dev を起動しておく（別ターミナル）
   pnpm exec playwright open --save-storage=tests/e2e/.auth/state.json http://localhost:3000
   ```
   開いたブラウザで手動ログイン（メール・パスワード・確認コード `424242`）→
   タスク画面が出たら**ブラウザを閉じる**（`state.json` が保存される）。

### 実行
```bash
pnpm test:e2e
```

### state.json が切れたら
セッション期限が切れると認証テストが失敗する。その場合は上の「4. ログイン状態を保存」をやり直す。

## メモ
- `tests/e2e/.auth/`・`state.json` は秘密情報なので git 管理外（`.gitignore` 済み）。
- ログアウトのテストは共有セッションを無効化するため `zz-logout.spec.ts` で最後に実行している。
- フロントのコンポーネント単体テストは書かない（UI の正しさは E2E が担保）。
