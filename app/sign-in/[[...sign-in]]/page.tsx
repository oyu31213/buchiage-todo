import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-amber-50 p-6">
      <h1 className="text-2xl font-bold text-stone-900">ぶちあげ Todo</h1>
      <SignIn />
    </main>
  );
}
