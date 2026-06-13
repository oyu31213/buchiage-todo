import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function TodoHeader() {
  return (
    <header
      data-testid="todo-header"
      className="flex items-center justify-between border-b border-border pb-4"
    >
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        ぶちあげ Todo
      </h1>
      <SignOutButton redirectUrl="/sign-in">
        <Button variant="outline" size="sm" data-testid="logout-button">
          ログアウト
        </Button>
      </SignOutButton>
    </header>
  );
}
