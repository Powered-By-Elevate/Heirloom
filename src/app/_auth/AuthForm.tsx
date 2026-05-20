"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
  title: string;
  subtitle: string;
}

// Only redirect to in-app paths to avoid open-redirect vulnerabilities.
function safeNext(next: string | null): string {
  if (!next) return "/catalogs";
  if (!next.startsWith("/")) return "/catalogs";
  if (next.startsWith("//")) return "/catalogs";
  return next;
}

export function AuthForm({ mode, title, subtitle }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  const otherMode = mode === "login" ? "signup" : "login";
  const otherLabel =
    mode === "login" ? "Need an account?" : "Already have one?";
  const otherCta = mode === "login" ? "Sign up" : "Sign in";
  const otherHref =
    next && next !== "/catalogs"
      ? `/${otherMode}?next=${encodeURIComponent(next)}`
      : `/${otherMode}`;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-foreground">{title}</h1>
          <p className="mt-3 text-muted-foreground">{subtitle}</p>
        </div>

        <Card className="border-border/60 shadow-sm bg-card">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@family.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "signup" ? "At least 6 characters" : "Your password"
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || !email || password.length < 6}
              >
                {submitting
                  ? mode === "signup"
                    ? "Creating account…"
                    : "Signing in…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {otherLabel}{" "}
          <Link
            href={otherHref}
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            {otherCta}
          </Link>
        </p>
      </div>
    </div>
  );
}
