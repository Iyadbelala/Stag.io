"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiCheckCircle,
} from "react-icons/hi";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/api/contact", form);
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <HiCheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight text-coffee-dark">
            Message Sent!
          </h1>
          <p className="mt-3 max-w-md text-text-secondary">
            Thank you for reaching out. We&apos;ll get back to you as soon as
            possible.
          </p>
          <Link
            href="/"
            className="mt-8 rounded-button bg-coffee-warm px-8 py-3 text-sm font-medium text-text-inverse shadow-md transition-all hover:bg-coffee-gold hover:shadow-lg"
          >
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-heading text-4xl font-bold tracking-tight text-coffee-dark">
        Contact Us
      </h1>
      <p className="mt-3 text-text-secondary">
        Have a question or feedback? We&apos;d love to hear from you.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="w-full rounded-[--radius-button] border border-surface-sand bg-surface-cream px-4 py-2.5 text-sm text-text-primary outline-none focus:border-coffee-gold"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full rounded-[--radius-button] border border-surface-sand bg-surface-cream px-4 py-2.5 text-sm text-text-primary outline-none focus:border-coffee-gold"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              placeholder="How can we help?"
              required
              className="w-full rounded-[--radius-button] border border-surface-sand bg-surface-cream px-4 py-2.5 text-sm text-text-primary outline-none focus:border-coffee-gold"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="Write your message..."
              required
              className="w-full rounded-[--radius-button] border border-surface-sand bg-surface-cream px-4 py-2.5 text-sm text-text-primary outline-none focus:border-coffee-gold resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-button bg-coffee-warm px-8 py-3.5 text-sm font-medium text-text-inverse shadow-md transition-all hover:bg-coffee-gold hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <div className="rounded-[--radius-card] border border-surface-sand bg-surface-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-coffee-dark">
              Get in Touch
            </h2>
            <div className="mt-4 flex flex-col gap-3 text-sm text-text-secondary">
              <span className="flex items-center gap-2">
                <HiOutlineMail className="shrink-0 text-coffee-gold" size={18} />
                contact@stag.io
              </span>
              <span className="flex items-center gap-2">
                <HiOutlineLocationMarker
                  className="shrink-0 text-coffee-gold"
                  size={18}
                />
                Constantine, Algeria
              </span>
            </div>
          </div>

          <div className="rounded-[--radius-card] border border-surface-sand bg-surface-sand/40 p-6">
            <h2 className="text-lg font-semibold text-coffee-dark">
              Office Hours
            </h2>
            <div className="mt-3 flex flex-col gap-1 text-sm text-text-secondary">
              <p>Sunday &ndash; Thursday: 8:00 AM &ndash; 5:00 PM</p>
              <p>Friday &ndash; Saturday: Closed</p>
            </div>
          </div>
        </div>
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