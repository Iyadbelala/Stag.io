import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide when creating an account, such as your name, email address, university affiliation, and CV. We also collect usage data including pages visited, actions taken, and device information.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "Your information is used to provide and improve the Stag.io platform, match students with internship opportunities, facilitate communication between students, companies, and universities, and send relevant notifications about your applications.",
  },
  {
    title: "3. Information Sharing",
    content:
      "We share your profile information with companies when you apply for an internship and with university administration for agreement validation. We do not sell your personal data to third parties.",
  },
  {
    title: "4. Data Security",
    content:
      "We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and regular security audits.",
  },
  {
    title: "5. Data Retention",
    content:
      "We retain your data for as long as your account is active. You can request deletion of your account and associated data at any time by contacting our support team.",
  },
  {
    title: "6. Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data. You may also request a copy of your data in a portable format. To exercise these rights, contact us at contact@stag.io.",
  },
  {
    title: "7. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through a notice on the platform.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-heading text-4xl font-bold tracking-tight text-coffee-dark">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        Last updated: February 14, 2026
      </p>
      <p className="mt-4 text-text-secondary leading-relaxed">
        At Stag.io, we take your privacy seriously. This policy explains how we
        collect, use, and protect your personal information when you use our
        platform.
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
