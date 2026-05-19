import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply to your use of Heirloom.",
};

const lastUpdated = "May 19, 2026";

export default function TermsPage() {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Home
      </Link>
      <h1 className="font-serif text-5xl text-foreground mt-3">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>

      <div className="prose prose-stone mt-8 max-w-none">
        <p>
          By using Heirloom, you agree to these Terms. If you don&apos;t agree,
          please don&apos;t use the service.
        </p>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Your account
        </h2>
        <p>
          You&apos;re responsible for maintaining the confidentiality of your
          credentials and for everything that happens under your account. Use a
          strong password and let us know promptly if you suspect your account
          has been compromised.
        </p>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Your content
        </h2>
        <p>
          You retain all rights to the recipes, photos, and text you contribute.
          By uploading content, you grant us a limited license to store, display,
          and process that content so we can provide the service to you and the
          people you share cookbooks with.
        </p>
        <p className="mt-3">
          Don&apos;t upload content you don&apos;t have permission to share, and
          don&apos;t upload anything illegal, abusive, or that infringes
          someone else&apos;s rights.
        </p>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Acceptable use
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground/90">
          <li>No reverse engineering, abusing the service, or attacking it.</li>
          <li>No spam, harassment, or sharing of others&apos; private data.</li>
          <li>No content that violates applicable law.</li>
        </ul>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Termination
        </h2>
        <p>
          You can delete your account at any time from your{" "}
          <Link
            href="/account"
            className="text-primary underline-offset-4 hover:underline"
          >
            account page
          </Link>
          . We may suspend or terminate accounts that violate these Terms.
        </p>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Disclaimer
        </h2>
        <p>
          Heirloom is provided &ldquo;as is&rdquo; without warranties of any
          kind. Recipes are user-submitted content; we don&apos;t verify
          accuracy or food-safety. Use your judgment.
        </p>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Liability
        </h2>
        <p>
          To the maximum extent permitted by law, we are not liable for indirect,
          incidental, or consequential damages arising from your use of the
          service.
        </p>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Changes
        </h2>
        <p>
          We may update these Terms from time to time. We&apos;ll update the
          &ldquo;last updated&rdquo; date at the top.
        </p>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Contact
        </h2>
        <p>
          Questions? Email{" "}
          <span className="font-mono text-foreground">
            [your-contact-email]
          </span>
          .
        </p>

        <p className="text-sm text-muted-foreground mt-12 border-t border-border pt-6">
          This is a starter Terms document. Have it reviewed by counsel before
          you publish to an app store. Update the contact email above.
        </p>
      </div>
    </main>
  );
}
