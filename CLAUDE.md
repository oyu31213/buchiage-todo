# CLAUDE.md

## このプロジェクトについて

Claude Code で **Todo アプリをゼロから作る**ための学習用プロジェクトです。
ソフトウェアエンジニアでない人が、Claude Code の「CLAUDE.md・スキル・Plan mode・MCP」を使うと
出力がどう変わるかを体感することを目的にしています。

**開発の進め方は [MANUAL.md](./MANUAL.md) を必ず参照してください。**

このリポジトリには最初、アプリ本体のコードは入っていません。あなた（Claude）が
スキルと下記の規約に従って構築します。

## 技術スタック

| 種別 | 採用技術 |
|---|---|
| フレームワーク | Next.js（App Router） |
| 言語 | TypeScript |
| 認証 | Clerk |
| ORM | Drizzle |
| バリデーション | Zod |
| UI | shadcn/ui |
| パッケージ管理 | **pnpm**（`npm` / `yarn` は使わない） |
| ローカル DB | **docker compose の PostgreSQL 17** |
| テスト | Playwright（E2E）/ Vitest（バックエンドの unit） |
| コミット | Conventional Commits |

## プロジェクト構成規約（地図）

ファイルの置き場所は最初から固定です。**この規約に無い場所に勝手にファイルを増やさないでください。**
新しく必要になった実装も、必ず下記のどこに置くか判断してから作ります。

```
app/                      # Next.js App Router（ルーティング・画面）
  layout.tsx / page.tsx
  <route>/page.tsx
middleware.ts             # Clerk 認証ミドルウェア（保護する画面を定義）
components/
  ui/                     # shadcn/ui が生成する素の部品（原則そのまま使う／書き換えない）
  <feature>/              # Pencil デザインに合わせた独自コンポーネント（ui/ を組み合わせて作る）
lib/
  db/
    schema.ts             # Drizzle スキーマ定義（テーブル定義）
    index.ts              # DB クライアント初期化
    migrations/           # drizzle-kit が生成するマイグレーション
  actions/                # Server Actions（"use server"。DB 操作の入口）
  validations/            # Zod スキーマ（入力バリデーション）
  utils.ts                # shadcn が作る cn() 等の共通ユーティリティ
drizzle.config.ts         # drizzle-kit 設定（schema / migrations のパスを指す）
docker-compose.yml        # ローカル開発用 PostgreSQL 17
.env.local                # DATABASE_URL / Clerk キー等（git 管理外。雛形は .env.example）
tests/
  e2e/                    # Playwright E2E（受け入れ条件 1 つ = 1 テスト。UI の振る舞い）
  unit/                   # Vitest unit（バックエンドロジックのみ：actions / validations / db）
docs/requirements/        # 要件・受け入れ条件（requirements スキルの出力）
```

### 配置ルール

- **Drizzle**: スキーマは `lib/db/schema.ts`、マイグレーションは `lib/db/migrations/`、設定は `drizzle.config.ts`。
- **shadcn/ui**: `npx shadcn` で入る素の部品は `components/ui/`（編集しない）。Pencil デザインに合わせた組み合わせ・カスタムは `components/<feature>/`。
- **Server Actions**: `lib/actions/` に置き、DB アクセスは必ずここを経由。component から直接 DB を触らない。
- **Zod**: 入力スキーマは `lib/validations/`。Server Actions の入口で必ず検証する。
- **Clerk**: 認証は `middleware.ts` で保護。どの画面を保護するか明記する。
- **テスト**: フロントの component 単体テストは書かない（UI の正しさは E2E で担保）。

## 開発ルール

1. **受け入れ条件ベースで進める。** 「どうなれば完成か」を `docs/requirements/` で先に決め、
   テスト・最終確認はすべてこの受け入れ条件を基準にする。
2. **実装の前に Plan mode で計画を人間がレビューする。** 何をするかを日本語で提示し、承認を得てから実装する。
3. **スコープ外は要件で宣言する。** 「今回やらないこと」を必ず明示する。
4. **テストは受け入れ条件にトレースする。** 各テストがどの受け入れ条件に対応するかをコメントで明記する。
5. **コミットは Conventional Commits** で行う（`feat:` `fix:` `docs:` など）。
6. **破壊的コマンドは禁止。** `.claude/settings.json` で `rm` / `git reset --hard` / `docker compose down -v` 等を deny 済み。

> 注: permission は「PC やデータを壊すコマンドの抑止」用です。アプリを論理的に壊した場合の
> 巻き戻し（git でのセーフティネット）は、このプロジェクトでは扱いません（MANUAL.md 参照）。

## 使うスキル

### このプロジェクトに同梱のスキル（`.claude/skills/`）— 開発プロセス

| スキル | いつ使うか |
|---|---|
| `requirements` | 作り始める前。スコープと受け入れ条件を決める |
| `design` | 要件の後・実装の前。Pencil でデザインを作る |
| `dev-server` | アプリを起動するとき。docker DB + `pnpm dev` |
| `write-tests` | 実装の後。E2E + バックエンドの unit テスト |

> コードレビューは Claude Code の **built-in コマンド `/code-review`**（必要に応じて `/review` / `/security-review`）を使う。
> 自前のレビュースキルは用意しない。動作確認は E2E テストと、人間がブラウザで触る最終確認で行う。

### skills.sh から導入するスキル（最初に各自インストールする）

技術スタックの専門知識は、自前で書かず skills.sh の既存スキルを使います。
セットアップ時に以下をインストールしてください（詳細は MANUAL.md の「前提準備」）。

```bash
# 認証 Clerk（公式）: 初期構築 + Next.js 実装パターン（middleware / Server Actions 保護）
npx skills add clerk/skills@clerk-setup
npx skills add clerk/skills@clerk-nextjs-patterns

# フレームワーク・UI
npx skills add vercel-labs/vercel-plugin@nextjs
npx skills add vercel-labs/vercel-plugin@shadcn

# ORM Drizzle / バリデーション Zod
npx skills add bobmatnyc/claude-mpm-skills@drizzle-orm
npx skills add pproenca/dot-skills@zod

# Conventional Commits
npx skills add dgalarza/claude-code-workflows@conventional-commits
```

> skills.sh のスキルは中身が更新されることがあります。`npx skills find "<キーワード>"` で
> 最新を探し、入れたものをこの一覧に追記してください。
