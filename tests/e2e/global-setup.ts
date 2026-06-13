import { clerkSetup } from "@clerk/testing/playwright";

// Clerk のテスト用トークン発行などの初期化（@clerk/testing）。
// CLERK の公開鍵・秘密鍵（.env.local）を使う。
export default async function globalSetup() {
  await clerkSetup();
}
