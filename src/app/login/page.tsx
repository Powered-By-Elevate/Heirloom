import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../_auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your family cookbook.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm
        mode="login"
        title="Welcome back"
        subtitle="Sign in to your account."
      />
    </Suspense>
  );
}
