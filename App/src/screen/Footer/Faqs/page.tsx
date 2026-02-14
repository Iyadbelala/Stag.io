"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    question: "What is Stag.io?",
    answer:
      "Stag.io is an internship management platform that connects students, companies, and universities. It streamlines the entire internship lifecycle — from discovering opportunities to final validation.",
  },
  {
    question: "Who can use Stag.io?",
    answer:
      "Stag.io is designed for three types of users: students looking for internships, companies offering internship positions, and university administration managing the validation process.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Click the 'Get Started' button on the homepage and choose your role (student, company, or administration). Fill in your details and verify your email to get started.",
  },
  {
    question: "Is Stag.io free to use?",
    answer:
      "Yes, Stag.io is free for students and university staff. Companies can post internship offers at no cost during our launch phase.",
  },
  {
    question: "How do I apply for an internship?",
    answer:
      "Browse available offers, click on one that interests you, and submit your application with your CV and cover letter. You can track your application status from your dashboard.",
  },
  {
    question: "How does the validation process work?",
    answer:
      "Once a company accepts a student's application, the internship agreement is sent to the university administration for review and approval. All parties are notified at each step.",
  },
  {
    question: "Can I edit my application after submitting?",
    answer:
      "You can update your profile and CV at any time, but once an application is submitted, it cannot be modified. You may withdraw and reapply if the offer is still open.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Visit our Help Center or send an email to contact@stag.io. We aim to respond within 24 hours.",
  },
];

export default function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-heading font-bold tracking-tight text-coffee-dark">
        Frequently Asked Questions
      </h1>
      <p className="mt-3 text-text-secondary">
        Quick answers to the most common questions about Stag.io.
      </p>

      <div className="mt-12 flex flex-col divide-y divide-surface-sand">
        {faqs.map((faq, i) => (
          <div key={faq.question} className="py-5">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-base font-medium text-coffee-dark">
                {faq.question}
              </span>
              <span className="ml-4 shrink-0 text-xl text-coffee-gold">
                {openIndex === i ? "−" : "+"}
              </span>
            </button>
            {openIndex === i && (
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {faq.answer}
              </p>
            )}
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
