import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";

interface AppHeaderProps {
  catalogName?: string;
  rightSlot?: React.ReactNode;
}

export function AppHeader({ catalogName, rightSlot }: AppHeaderProps) {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <Link
            href="/catalogs"
            className="font-serif text-2xl text-foreground hover:text-primary transition-colors"
          >
            Heirloom
          </Link>
          {catalogName ? (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="font-serif text-lg text-foreground">
                {catalogName}
              </span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {rightSlot}
          <Button asChild variant="ghost" size="sm">
            <Link href="/account">Account</Link>
          </Button>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
