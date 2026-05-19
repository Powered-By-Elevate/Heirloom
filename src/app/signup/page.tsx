import type { Metadata } from "next";
import { AuthForm } from "../_auth/AuthForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Start your shared family cookbook on Heirloom.",
};

export default function SignupPage() {
  return (
    <AuthForm
      mode="signup"
      title="Start your cookbook"
      subtitle="We'll email you a magic link — no password to remember."
    />
  );
}
