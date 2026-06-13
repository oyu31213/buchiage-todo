---
name: dev-server
description: ローカル開発サーバーを起動するスキル。アプリをブラウザで動かして確認したいときに使う。docker compose で PostgreSQL 17 を起動し、DBの疎通とマイグレーションを確認してから pnpm dev を起動する。「アプリを起動して」「ローカルで動かして」「サーバーを立てて」と言われたら使う。
---

# 開発サーバー起動スキル

アプリをブラウザで動かせる状態にします。DB(PostgreSQL 17)とアプリ本体の両方を起動します。
**サーバーは起動したまま常駐**させるので、必ずバックグラウンドで起動します。

## 起動手順（この順番を守る）

1. **DB のポートを決める（ポート競合を避ける）。**
   まず、このプロジェクトの DB が既に起動済みかを見る。

   ```bash
   docker compose ps
   ```

   `todo_db` が既に起動中ならそれを使うのでこの手順はスキップし、次の「2. DB を起動する」へ。
   起動していない場合は、ホスト側ポート（既定 5432）が空いているか確認し、使用中なら空くまで番号を上げる。

   ```bash
   DB_PORT=5432
   while lsof -iTCP:"$DB_PORT" -sTCP:LISTEN >/dev/null 2>&1; do
     DB_PORT=$((DB_PORT + 1))
   done
   export DB_PORT
   echo "使用する DB ポート: $DB_PORT"
   ```

   - `export` した `DB_PORT` は、この後の `docker compose` / マイグレーション / `pnpm dev` すべてに引き継がれる（同じシェルで続けて実行すること）。
   - `docker-compose.yml` のポートは `${DB_PORT:-5432}`、`.env.local` の `DATABASE_URL` も `${DB_PORT}` を参照するので、この 1 変数で両方そろう。
   - **5432 以外になったときは、人間にそのポート番号を伝える**（例:「5432 が使用中だったので 5433 で起動しました」）。`.env.local` を自分で書いている場合は `DB_PORT` を合わせてもらう。

2. **DB を起動する。**
   ```bash
   docker compose up -d
   ```
   PostgreSQL 17 がバックグラウンドで起動する（上で決めた `DB_PORT` で公開される）。

3. **DB の疎通を確認する。** コンテナが healthy になるまで待つ。
   ```bash
   docker compose ps
   ```
   起動直後は接続できないことがあるので、状態が healthy になるのを確認してから次へ進む。

4. **マイグレーションを適用する。** スキーマ(`lib/db/schema.ts`)に変更があれば DB に反映する。
   ```bash
   pnpm drizzle-kit migrate
   ```
   （プロジェクトに定義された migrate 用スクリプトがあればそれを使う。）

5. **開発サーバーを起動する（バックグラウンド）。**
   ```bash
   pnpm dev
   ```
   このコマンドは常駐するので、必ずバックグラウンド実行する。

6. **起動完了をヘルスチェックする。** ポート(通常 3000)が応答するか確認する。
   ```bash
   curl -sS -o /dev/null -w "%{http_code}" http://localhost:3000
   ```
   200/3xx 系が返れば起動完了。返らなければ少し待って再確認する。

## うまくいかないとき

- `docker compose` でポート競合（`address already in use`）→ 手順1の `DB_PORT` 自動探索を通したか確認。
  自分の `todo_db` が既に起動中なだけなら、それを使えばよい（`docker compose ps`）。
- DB に接続できない → `.env.local` の `DATABASE_URL`（＝ `DB_PORT`）が、起動した DB のポートと一致しているか確認。
  手順1で 5432 以外になった場合、その `DB_PORT` が同じシェルに `export` されているか／`.env.local` に反映されているかを見る。
- `pnpm` が見つからない → pnpm が未インストール。MANUAL.md の前提準備を確認。

## 注意

- DB のデータを消す `docker compose down -v` は実行しない（permission でも禁止されている）。
  通常停止は `docker compose stop`。
- パッケージ管理は必ず `pnpm`。`npm` / `yarn` は使わない。

起動したら、テストの実行や、**人間がブラウザで触って最終確認**するのに使います（MANUAL.md 参照）。
