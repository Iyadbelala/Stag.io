import Link from "next/link";

const sections = [
  {
    title: "1. What Are Cookies?",
    content:
      "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your browsing experience.",
  },
  {
    title: "2. Essential Cookies",
    content:
      "These cookies are necessary for the platform to function properly. They handle authentication, session management, and security. You cannot opt out of essential cookies.",
  },
  {
    title: "3. Analytics Cookies",
    content:
      "We use analytics cookies to understand how visitors interact with Stag.io. This helps us improve the platform. These cookies collect anonymous usage data such as pages visited and time spent on the site.",
  },
  {
    title: "4. Preference Cookies",
    content:
      "Preference cookies remember your settings and choices, such as language preferences and display options, so you don't have to set them every time you visit.",
  },
  {
    title: "5. Managing Cookies",
    content:
      "You can control and delete cookies through your browser settings. Note that disabling certain cookies may affect the functionality of the platform.",
  },
  {
    title: "6. Third-Party Cookies",
    content:
      "We do not use third-party advertising cookies. Any third-party services we integrate (such as analytics) follow their own cookie policies.",
  },
  {
    title: "7. Updates to This Policy",
    content:
      "We may update this Cookie Policy periodically. Changes will be posted on this page with an updated revision date.",
  },
];

export default function CookiesPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-heading text-4xl font-bold tracking-tight text-coffee-dark">
        Cookie Policy
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        Last updated: February 14, 2026
      </p>
      <p className="mt-4 text-text-secondary leading-relaxed">
        This policy explains how Stag.io uses cookies and similar technologies.
      </p>

      <div className="mt-12 flex flex-col gap-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-semibold text-coffee-dark">
              {s.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {s.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-coffee-warm hover:text-coffee-gold transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
    </section>
  );
}
