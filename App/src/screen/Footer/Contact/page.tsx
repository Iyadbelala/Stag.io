import Link from "next/link";
import {
  HiOutlineMail,
  HiOutlineLocationMarker,
} from "react-icons/hi";

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-heading font-bold tracking-tight text-coffee-dark">
        Contact Us
      </h1>
      <p className="mt-3 text-text-secondary">
        Have a question or feedback? We&apos;d love to hear from you.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {/* Contact Form */}
        <form className="flex flex-col gap-5">
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
              placeholder="Your name"
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
              placeholder="you@example.com"
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
              placeholder="How can we help?"
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
              placeholder="Write your message..."
              className="w-full rounded-[--radius-button] border border-surface-sand bg-surface-cream px-4 py-2.5 text-sm text-text-primary outline-none focus:border-coffee-gold resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-button bg-coffee-warm px-8 py-3.5 text-sm font-medium text-text-inverse shadow-md transition-all hover:bg-coffee-gold hover:shadow-lg cursor-pointer"
          >
            Send Message
          </button>
        </form>

        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <div className="rounded-[--radius-card] border border-surface-sand bg-surface-white p-6 shadow-sm">
            <h2 className="text-lg font-heading font-semibold text-coffee-dark">
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
            <h2 className="text-lg font-heading font-semibold text-coffee-dark">
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
