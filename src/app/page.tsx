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
          The recipes that
          <br />
          taste like home.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Grandma&apos;s banana bread. Mom&apos;s chili. The dinner your kid
          calls home asking how to make. A shared cookbook for the food that
          matters most — gathered in one place for the people who&apos;ll cook
          it next.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="px-8">
            <Link href="/signup">Start a cookbook</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
