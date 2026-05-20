import type { Metadata } from "next";
import { AuthForm } from "../_auth/AuthForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Start your shared family cookbook on From Our Table.",
};

export default function SignupPage() {
  return (
    <AuthForm
      mode="signup"
      title="Start your cookbook"
      subtitle="A shared cookbook for the food your family loves."
    />
  );
}
