import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// バックエンドロジック（Server Actions / Zod / DB ヘルパー）の unit テスト用。
// フロントのコンポーネント単体テストは書かない（UI は E2E で担保）。
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // import の "@/..." をプロジェクトルートに解決する（tsconfig の paths と揃える）。
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
