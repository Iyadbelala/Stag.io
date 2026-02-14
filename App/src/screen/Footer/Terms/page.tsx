import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Stag.io, you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform.",
  },
  {
    title: "2. Eligibility",
    content:
      "You must be at least 18 years old or a registered university student to create an account. Company accounts must be created by authorized representatives of the organization.",
  },
  {
    title: "3. User Accounts",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration and keep your profile up to date.",
  },
  {
    title: "4. Acceptable Use",
    content:
      "You agree not to misuse the platform, including posting false information, impersonating others, spamming, or attempting to access unauthorized areas of the system. Violations may result in account suspension.",
  },
  {
    title: "5. Internship Listings",
    content:
      "Companies are responsible for the accuracy of their internship listings. Stag.io does not guarantee the availability, quality, or legality of any posted position.",
  },
  {
    title: "6. Intellectual Property",
    content:
      "All content on Stag.io, including the logo, design, and software, is the property of the Stag.io team. User-submitted content (CVs, descriptions) remains the property of the respective user.",
  },
  {
    title: "7. Limitation of Liability",
    content:
      "Stag.io is provided \"as is\" without warranties. We are not liable for any damages arising from the use of the platform, including but not limited to lost opportunities or data.",
  },
  {
    title: "8. Termination",
    content:
      "We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through your settings or by contacting support.",
  },
  {
    title: "9. Changes to Terms",
    content:
      "We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-heading font-bold tracking-tight text-coffee-dark">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        Last updated: February 14, 2026
      </p>
      <p className="mt-4 text-text-secondary leading-relaxed">
        Please read these terms carefully before using the Stag.io platform.
      </p>

      <div className="mt-12 flex flex-col gap-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-heading font-semibold text-coffee-dark">
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
