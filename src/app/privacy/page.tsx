import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How From Our Table collects, uses, and protects your information.",
};

const lastUpdated = "May 19, 2026";

export default function PrivacyPage() {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Home
      </Link>
      <h1 className="font-serif text-5xl text-foreground mt-3">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>

      <div className="prose prose-stone mt-8 max-w-none">
        <p>
          From Our Table (&ldquo;we,&rdquo; &ldquo;us&rdquo;) is a shared digital
          cookbook. This Privacy Policy describes what we collect, how we use it,
          and the controls available to you.
        </p>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          What we collect
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground/90">
          <li>
            <strong>Account information:</strong> the email address and password
            you provide at sign-up.
          </li>
          <li>
            <strong>Content you create:</strong> cookbooks, recipes, ingredients,
            instructions, notes, tags, and any photos you upload of dishes or
            recipe cards.
          </li>
          <li>
            <strong>Membership data:</strong> which cookbooks you belong to and
            your role within them.
          </li>
          <li>
            <strong>Technical data:</strong> standard server logs (IP address,
            user agent, timestamps) from your authenticated requests.
          </li>
        </ul>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          How we use it
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground/90">
          <li>To operate From Our Table and keep your cookbook accessible.</li>
          <li>To authenticate you and protect your account.</li>
          <li>
            To extract structured recipe data from images you upload (we send
            the image to a third-party AI provider, see below).
          </li>
          <li>
            To investigate abuse or technical problems. We do not sell your
            information.
          </li>
        </ul>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Third parties
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground/90">
          <li>
            <strong>Supabase</strong> — hosts your account data, recipes, and
            images.
          </li>
          <li>
            <strong>Google (Gemini API)</strong> — processes uploaded recipe
            card images to extract structured text. Sent only when you upload an
            image for extraction.
          </li>
          <li>
            <strong>Vercel</strong> — hosts and serves the application.
          </li>
        </ul>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Your controls
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground/90">
          <li>
            <strong>Delete your account.</strong> Visit{" "}
            <Link
              href="/account"
              className="text-primary underline-offset-4 hover:underline"
            >
              your account page
            </Link>{" "}
            to permanently delete your account, the cookbooks you own, and all
            associated recipes and images.
          </li>
          <li>
            <strong>Leave a shared cookbook.</strong> The cookbook owner can
            remove your membership at any time.
          </li>
          <li>
            <strong>Edit or remove content.</strong> You can edit and delete the
            recipes you&apos;ve added in cookbooks where you have
            contributor or owner access.
          </li>
        </ul>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Children
        </h2>
        <p>
          From Our Table is not directed to children under 13. We do not knowingly
          collect personal information from children under 13.
        </p>

        <h2 className="font-serif text-2xl text-foreground mt-8 mb-3">
          Contact
        </h2>
        <p>
          Questions about this policy? Email{" "}
          <span className="font-mono text-foreground">
            [your-contact-email]
          </span>
          .
        </p>

        <p className="text-sm text-muted-foreground mt-12 border-t border-border pt-6">
          This is a starter policy. Before launching to the public, have it
          reviewed by counsel to ensure compliance with the laws that apply to
          you (GDPR, CCPA, COPPA, App Store / Play Store requirements, etc.) and
          update the contact email above.
        </p>
      </div>
    </main>
  );
}
