---
name: start-new-repo
description: ai-coding-example テンプレートを gh コマンドで clone し、ユーザー自身の GitHub に新しいリポジトリを作って push するスキル。「テンプレから自分のリポジトリを作りたい」「start-new-repo」「ai-coding-example を clone して自分の GitHub にリポジトリを作って」「このテンプレで新しいプロジェクトを GitHub に作って」と言われたら使う。リポジトリ名と private/public を必ず本人に聞いてから実行する。
---

# 新規リポジトリ立ち上げスキル（start-new-repo）

テンプレート **`spyuchan/ai-coding-example`** を `gh` で clone し、テンプレの履歴・remote から切り離して、
**実行者自身の GitHub アカウントに新しいリポジトリを作成して push** します。
ゴールは「**自分の GitHub にそのリポジトリがある状態**」まで。

推測で進めないこと。**リポジトリ名と公開設定（private/public）は必ず本人に確認**してから実行します。

## 前提

- `gh`（GitHub CLI）がインストール済みで、**ログイン済み**であること。
- 確認:
  ```bash
  gh auth status
  ```
  ログインしていなければ、ユーザーに次を案内する（自分で実行はしない。`!` を付けるとこの会話内で実行できる）:
  > `! gh auth login`
- 作成されるリポジトリの所有者は **`gh` でログイン中のアカウント**になる（＝「自分の GitHub」）。

## 手順

### 1. 必要な情報を本人に確認する（推測しない）

**AskUserQuestion** で次を確認する:

1. **リポジトリ名**（＝ローカルのディレクトリ名にもなる）。
2. **公開設定**: `private` か `public` か。
3. （任意）**clone する場所**。既定はカレントディレクトリに `<リポジトリ名>/` を作る。別の場所がよければパスを聞く。

> ⚠️ いま **このテンプレリポジトリの中**で作業している場合、カレントに clone すると入れ子になる。
> 既定では**一つ上の階層**（`../<リポジトリ名>`）など、テンプレの外に置くのが安全。本人と置き場所を合わせる。

### 2. テンプレートを clone する

```bash
gh repo clone spyuchan/ai-coding-example <リポジトリ名>
```

別の場所に置くなら clone 先パスを末尾に指定する（例: `gh repo clone spyuchan/ai-coding-example ../<リポジトリ名>`）。

### 3. テンプレの remote を切り離す

clone 直後は `origin` がテンプレ（`spyuchan/ai-coding-example`）を指している。自分のリポジトリにするため外す。

```bash
cd <リポジトリ名>
git remote remove origin
```

> 履歴（テンプレの初期コミット）はそのまま引き継がれる。気にする場合のみ、本人に確認のうえ後でやり直す。
> **`rm -rf .git` は使わない**（このプロジェクトの設定で禁止されている）。

### 4. 自分の GitHub にリポジトリを作成して push する

公開設定に応じて `--private` または `--public` を付ける。`--source=.` で今の clone をそのまま新リポジトリにする。

```bash
# private の場合
gh repo create <リポジトリ名> --private --source=. --remote=origin --push

# public の場合
gh repo create <リポジトリ名> --public  --source=. --remote=origin --push
```

- これで「自分のアカウントに新規リポジトリ作成 → `origin` を新リポジトリに設定 → `main` を push」まで一括で完了する。
- 別アカウント/組織に作りたい場合のみ `<owner>/<リポジトリ名>` の形で指定する。

### 5. できあがりを確認して報告する

```bash
gh repo view --web   # ブラウザで開く
```

または URL を表示:

```bash
gh repo view --json url --jq .url
```

本人に「**自分の GitHub に `<リポジトリ名>`（private/public）ができました**」と URL つきで伝える。

## 完了後の案内（次の一歩）

リポジトリができたら、開発を始める前に:

- `.env.local` は配布物に**含まれない**。`.env.example` を `.env.local` にコピーし、キーは本人が入れる。
- **`check-setup` スキル**（「環境が整っているか調べて」）で前提準備（Docker・pnpm・skills.sh・Pencil）を確認する。
- 進め方は `MANUAL.md`、規約は `CLAUDE.md` を参照。

## うまくいかないとき

- `gh: command not found` → GitHub CLI 未インストール。`brew install gh` などで導入。
- `gh auth status` で未ログイン → `! gh auth login` を案内する。
- `name already exists on this account` → 同名リポジトリが既にある。別名を本人に聞いて再実行。
- `git remote remove origin` で「No such remote」→ 既に外れている。そのまま手順4へ進んでよい。
