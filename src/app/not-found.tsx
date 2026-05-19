import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <p className="font-serif text-7xl text-primary leading-none">404</p>
        <h1 className="font-serif text-3xl text-foreground mt-4">
          Page not found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
