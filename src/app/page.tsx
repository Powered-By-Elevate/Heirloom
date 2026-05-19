import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/catalogs");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="max-w-xl text-center">
        <h1 className="font-serif text-5xl md:text-6xl text-foreground leading-tight">
          Your family&apos;s cookbook,
          <br />
          kept for keeps.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Heirloom is a shared place to preserve handwritten recipe cards,
          dish photos, and the stories behind them — so the food your family
          loves never gets lost.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="px-8">
            <Link href="/signup">Start your cookbook</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
