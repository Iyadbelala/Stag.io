import Link from "next/link";
import { HiOutlineMail } from "react-icons/hi";

const topics = [
  {
    title: "Getting Started",
    description:
      "Learn how to create your account, set up your profile, and navigate the platform.",
  },
  {
    title: "Applying for Internships",
    description:
      "Step-by-step guide on browsing offers, submitting applications, and tracking your status.",
  },
  {
    title: "Posting Internship Offers",
    description:
      "For companies: how to create listings, manage applications, and communicate with students.",
  },
  {
    title: "Administration & Validation",
    description:
      "For university staff: how to review agreements, manage users, and generate reports.",
  },
  {
    title: "Account & Security",
    description:
      "Manage your password, email preferences, and account settings.",
  },
  {
    title: "Technical Issues",
    description:
      "Troubleshooting common problems, browser compatibility, and performance tips.",
  },
];

export default function HelpPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-heading text-4xl font-bold tracking-tight text-coffee-dark">
        Help Center
      </h1>
      <p className="mt-3 text-text-secondary">
        Find answers and guides to help you get the most out of Stag.io.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {topics.map((topic) => (
          <div
            key={topic.title}
            className="rounded-[--radius-card] border border-surface-sand bg-surface-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-coffee-dark">
              {topic.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {topic.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[--radius-card] border border-surface-sand bg-surface-sand/40 p-8 text-center">
        <h2 className="text-xl font-semibold text-coffee-dark">
          Still need help?
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Our support team is here for you.
        </p>
        <a
          href="mailto:contact@stag.io"
          className="mt-4 inline-flex items-center gap-2 rounded-[--radius-button] bg-coffee-warm px-5 py-2.5 text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold"
        >
          <HiOutlineMail size={16} />
          Contact Support
        </a>
      </div>

      <div className="mt-10 text-center">
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
