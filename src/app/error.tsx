"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-4xl text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 text-muted-foreground">
          An unexpected error happened. Try again, or head back to your
          cookbooks.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => reset()}>
            Try again
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            onClick={() => reset()}
          >
            <a href="/catalogs">Back to cookbooks</a>
          </Button>
        </div>
        {error.digest ? (
          <p className="mt-6 text-xs text-muted-foreground font-mono">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
