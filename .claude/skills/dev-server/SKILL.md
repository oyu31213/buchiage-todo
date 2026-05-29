---
name: dev-server
description: ローカル開発サーバーを起動するスキル。アプリをブラウザで動かして確認したいときに使う。docker compose で PostgreSQL 17 を起動し、DBの疎通とマイグレーションを確認してから pnpm dev を起動する。「アプリを起動して」「ローカルで動かして」「サーバーを立てて」と言われたら使う。
---

# 開発サーバー起動スキル

アプリをブラウザで動かせる状態にします。DB(PostgreSQL 17)とアプリ本体の両方を起動します。
**サーバーは起動したまま常駐**させるので、必ずバックグラウンドで起動します。

## 起動手順（この順番を守る）

1. **DB を起動する。**
   ```bash
   docker compose up -d
   ```
   PostgreSQL 17 がバックグラウンドで起動する。

2. **DB の疎通を確認する。** コンテナが healthy になるまで待つ。
   ```bash
   docker compose ps
   ```
   起動直後は接続できないことがあるので、状態が healthy になるのを確認してから次へ進む。

3. **マイグレーションを適用する。** スキーマ(`lib/db/schema.ts`)に変更があれば DB に反映する。
   ```bash
   pnpm drizzle-kit migrate
   ```
   （プロジェクトに定義された migrate 用スクリプトがあればそれを使う。）

4. **開発サーバーを起動する（バックグラウンド）。**
   ```bash
   pnpm dev
   ```
   このコマンドは常駐するので、必ずバックグラウンド実行する。

5. **起動完了をヘルスチェックする。** ポート(通常 3000)が応答するか確認する。
   ```bash
   curl -sS -o /dev/null -w "%{http_code}" http://localhost:3000
   ```
   200/3xx 系が返れば起動完了。返らなければ少し待って再確認する。

## うまくいかないとき

- `docker compose` でポート競合 → すでに起動済みの可能性。`docker compose ps` を確認。
- DB に接続できない → `.env.local` の `DATABASE_URL` が docker-compose.yml の設定と一致しているか確認。
- `pnpm` が見つからない → pnpm が未インストール。MANUAL.md の前提準備を確認。

## 注意

- DB のデータを消す `docker compose down -v` は実行しない（permission でも禁止されている）。
  通常停止は `docker compose stop`。
- パッケージ管理は必ず `pnpm`。`npm` / `yarn` は使わない。

起動したら、テストの実行や、**人間がブラウザで触って最終確認**するのに使います（MANUAL.md 参照）。
