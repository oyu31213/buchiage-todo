---
name: check-setup
description: MANUAL.md「前提準備」が整っているか点検するスキル。開発を始める前の環境チェックに使う。Docker・pnpm・Node、skills.sh のスキル、Pencil(MCP)、プロジェクト土台ファイルがそろっているかを確認し、結果を表で示す。「環境が整っているか調べて」「前提準備をチェックして」「セットアップを確認して」「開発を始められる状態か見て」と言われたら使う。
---

# 前提準備チェックスキル

MANUAL.md「0. 前提準備」がそろっているかを点検し、**人間が一目で分かる表**で報告します。
開発を始める前（要件定義より前）に、まずこのチェックを通すのが目的です。

「整っている／整っていない」を必ず明示し、整っていない項目には**次に何をすればよいか**を添えます。
チェックするだけで、勝手にインストールや設定変更はしません（直す前に必ず人間に確認する）。

## チェック手順

下記4グループを順に確認します。コマンドが失敗しても止めず、最後にまとめて報告します。

### 1. ツール類（バージョンと Docker 稼働）

```bash
node -v; pnpm -v; docker -v; docker compose version
docker info >/dev/null 2>&1 && echo "docker daemon: running" || echo "docker daemon: NOT running"
```

- `node` / `pnpm` / `docker` / `docker compose` がそれぞれ応答すればOK。
- Docker は**デーモンが起動している**ことまで確認する（インストール済みでも未起動だと DB が立たない）。
- `npm` は使わない方針だが、存在確認だけしてもよい。

### 2. プロジェクト土台ファイル

```bash
ls -la CLAUDE.md MANUAL.md docker-compose.yml .env.example .claude/settings.json
ls -la docs/requirements
```

- 上記ファイルがそろっていればOK。
- `.claude/settings.json` は危険コマンド禁止設定。**中身は変更不要**、存在確認だけでよい。
- アプリ本体（`package.json` 等）と `.env.local` は**この時点では無くて正常**。土台作り（工程4）と環境変数設定はこれから行う工程なので、無くても「整っていない」とは扱わない。一言「これからの工程です」と添える。

### 3. skills.sh のスキル

MANUAL.md「前提準備」で入れる7つがそろっているかを確認する。
あなた（Claude）の**利用可能スキル一覧（available skills）**に、以下に相当するスキルが載っているかを見るのが最も確実：

- `clerk-setup`（Clerk 初期構築）
- `clerk-nextjs-patterns`（Clerk の Next.js 実装パターン）
- `nextjs`（Next.js）
- `shadcn`（shadcn/ui）
- `drizzle-orm`（Drizzle ORM）
- `zod`（Zod バリデーション）
- `conventional-commits`（Conventional Commits）

補助として、インストール先ディレクトリも確認してよい（環境により場所が異なることがある）：

```bash
ls .claude/skills 2>/dev/null
ls ~/.claude/skills 2>/dev/null
```

7つすべてあれば「整っている」。不足があれば、不足分だけ MANUAL.md の該当 `npx skills add ...` を案内する。

### 4. Pencil（MCP）の接続

デザイン工程（工程2 / `design` スキル）で使う Pencil が Claude Code につながっているか確認する。

```bash
claude mcp list
```

- 出力の `pencil` 行が `✔ Connected` ならOK。`✘ Failed to connect` なら未接続。
- 未接続のときは「デザイン工程（工程2）の前までに直せば大丈夫」と添える（要件定義は Pencil 不要）。

## 報告の仕方

確認が終わったら、必ずこの形でまとめる：

1. **「整っているもの」の表**（項目・状態を ✅ で）。
2. **「整っていないもの」**を分けて列挙し、各項目に**次の一手**を添える（例: 不足スキルの `npx skills add` コマンド、Docker を起動する、Pencil 拡張を立ち上げる）。
3. 末尾に、いま開発フローのどこから始められるかを一言（例:「要件定義（工程1）からなら今すぐ進められます」）。

「整っていない」項目があっても、**直すかどうかは人間に確認してから**。このスキルは点検が役割。

## 出力例（イメージ）

```
## ✅ 整っているもの
| 項目 | 状態 |
|---|---|
| Node.js | v24.x ✅ |
| pnpm | 11.x ✅ |
| Docker | 起動中 ✅ |
| 同梱スキル(4種) | ✅ |

## ⚠️ 整っていないもの
- skills.sh のスキルが未インストール → `npx skills add clerk/skills@clerk-setup` ほか
- Pencil(MCP) が接続失敗 → VS Code の Pencil 拡張を起動。デザイン工程の前までに直せばOK
```
