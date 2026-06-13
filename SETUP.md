# SETUP.md — 環境構築の実績手順（2026-06-13 実施）

このファイルは、buchiage-todo の開発を始める前の「前提準備（環境構築）」を、
**実際にやってうまくいった手順**としてまとめたものです。
MANUAL.md の「0. 前提準備」の実践版で、**今日つまずいた点と回避策**を入れてあります。
次に同じ環境を作るとき（別PC・別リポジトリ等）は、これを上から順になぞればOKです。

> 💡 全体のコツ：ツールのインストールは **あなた自身のターミナル**で実行します。
> Claude（私）のターミナルはあなたのMacと環境がズレていて、インストールが届きません。
> Claude には「コマンドを用意してもらう」「結果を見て判定してもらう」役割を任せます。

---

## 0. ゴール（これが全部そろえば完了）

| 項目 | 確認コマンド | 期待される結果 |
|---|---|---|
| Node.js | `node -v` | バージョンが出る |
| pnpm | `pnpm -v` | バージョンが出る |
| Docker | `docker compose version` | `Docker Compose version v…` が出る |
| Pencil(MCP) | （Claude に「環境を調べて」）| `pencil … ✔ Connected` |
| skills.sh の7スキル | `npx skills list` | 7つが `~/.claude/skills/ … Claude Code` で並ぶ |
| 土台ファイル | （最初から入っている） | CLAUDE.md / MANUAL.md など |

最後に Claude へ **「環境が整っているか調べて」** と頼むと、`check-setup` スキルが表でまとめてくれます。

---

## 1. Node.js（たいてい最初から入っている）

```bash
node -v
```
バージョンが出ればOK。出なければ Node.js（LTS版）をインストールしてください。

---

## 2. pnpm（パッケージ管理ツール）

**Homebrew で入れるのが一番確実**でした。

```bash
brew install pnpm
```
確認：
```bash
pnpm -v
```
バージョン（例：`10.18.2`）が出ればOK。

> ⚠️ つまずきポイント：`npm install -g pnpm` は環境次第で変な場所に入って失敗することがあります。
> **`brew install pnpm` を推奨**します。

---

## 3. Docker（ローカルDB用の PostgreSQL を動かす土台）

### 3-1. インストール
```bash
brew install --cask docker
```
（GUIアプリのダウンロードなので時間がかかります。普通のターミナルで実行してOK）

### 3-2. 【重要】アプリを起動する
**ダウンロードしただけでは `docker` コマンドは使えません。** 必ず起動します：

1. **Launchpad** または **アプリケーションフォルダ**から「**Docker**」を開く
2. 初回の「同意」「権限」の確認に進む（パスワードを求められたら入力）
3. 画面**右上のメニューバーにクジラ🐳**が出て、動きが落ち着けば起動完了（1〜2分）

### 3-3. 【重要】ターミナルを開き直す
docker の場所を読み込ませるため、**ターミナルを一度閉じて新しく開きます**。

### 3-4. 確認
```bash
docker compose version
```
`Docker Compose version v…` が出ればOK。

> ⚠️ つまずきポイント：「ダウンロード→起動→ターミナル再起動」の3つが揃って初めて使えます。
> `command not found: docker` が出るのは、たいてい「起動していない」か「ターミナル再起動前」です。

---

## 4. skills.sh の専門スキル（7つ）

技術スタックの専門知識を skills CLI で入れます。**ここが一番つまずきやすい**ので注意点込みで。

### 4-1. 正しいコマンド（owner名・source を修正済み）

下を**まるごとコピーして、ターミナルの一番左に `!` を付けて1回**実行します（後述）：

```bash
npx -y skills add clerk/skills@clerk-setup --agent claude-code
npx -y skills add clerk/skills@clerk-nextjs-patterns --agent claude-code
npx -y skills add vercel/vercel-plugin@nextjs --agent claude-code
npx -y skills add vercel/vercel-plugin@shadcn --agent claude-code
npx -y skills add ccheney/robust-skills@postgres-drizzle --agent claude-code
npx -y skills add pproenca/dot-skills@zod --agent claude-code
npx -y skills add dgalarza/claude-code-workflows@conventional-commits --agent claude-code
```

### 4-2. つまずきポイント（今日ハマった点）

1. **`--agent claude-code` を必ず付ける。**
   付けないと「どのAIに入れる？」と聞かれ、Claude Code 用ではない `~/.agents/skills/` に入ってしまい、Claude Code から使えません。
2. **owner名が古い箇所がある。**
   - `vercel-labs/vercel-plugin` は引っ越し済み → **`vercel/vercel-plugin`** を使う。
   - drizzle は `bobmatnyc/claude-mpm-skills@drizzle-orm` だとCLIが中身を取得できない（`No matching skills found`）→ **`ccheney/robust-skills@postgres-drizzle`** を使う（PostgreSQL特化でこのプロジェクトに最適）。
3. **複数コマンドはまとめて実行できる。** 1行ずつ打たなくても、上の7行を続けて貼ればOK。

### 4-3. 確認
```bash
npx skills list
```
7つが `~/claude/…/.claude/skills/ … Agents: Claude Code` で並べば成功です：
clerk-setup / clerk-nextjs-patterns / nextjs / shadcn / postgres-drizzle / zod / conventional-commits

> 別のスキルを探したいときは `npx skills find <キーワード>`（例：`npx skills find drizzle`）。

---

## 5. Pencil（MCP・デザイン作成用）

Claude に **「環境が整っているか調べて」** と頼み、`pencil … ✔ Connected` を確認します。
未接続なら VS Code の Pencil 拡張を起動してください（デザイン工程＝工程2の前までに直せばOK）。

---

## 6. 最終チェック

Claude に **「環境が整っているか調べて」** と頼むと、`check-setup` スキルが全項目を表で点検します。
すべて ✅ になれば、**要件定義（MANUAL.md の工程1）** に進めます。

---

## 付録：`!`（ビックリマーク）での実行が便利

Claude Code のチャット入力欄で、**行の一番左に `!` を付けて**コマンドを打つと、
そのコマンドが実行され、**結果が自動でチャットに入り、Claude がそのまま読めます**。
→ 結果をコピペして貼り直す手間がなくなります。

```
!docker compose version
```

> ⚠️ つまずきポイント：`!` は**行頭・スペースなし**で。`  ! docker…` のように前にスペースが入ると効きません。
> ※ Docker Desktop のような重いインストールは `!` ではなく普通のターミナルで実行する方が無難です。

---

## 付録：後片付けメモ（任意）

- 今日 `npm install -g pnpm` を試した名残で `~/.npm-global/bin/.npm-global/` という不要フォルダができている場合があります。気になれば削除可（pnpm は brew 版を使うので不要）。削除前に Claude に相談してください。
