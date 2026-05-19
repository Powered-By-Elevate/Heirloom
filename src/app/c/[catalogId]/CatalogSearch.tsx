"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CatalogSearchProps {
  defaultValue: string;
  catalogId: string;
}

export function CatalogSearch({ defaultValue, catalogId }: CatalogSearchProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set("q", value.trim());
    else next.delete("q");
    startTransition(() => {
      router.push(`/c/${catalogId}?${next.toString()}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search recipes by name…"
        className="pl-9 bg-card"
      />
    </form>
  );
}
