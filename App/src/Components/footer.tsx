import Link from "next/link";
import {
  HiOutlineMail,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import {
  FaLinkedinIn,
  FaXTwitter,
  FaGithub,
  FaInstagram,
} from "react-icons/fa6";

const footerLinks = {
  Platform: [
    { label: "Internships", href: "/internships" },
    { label: "Companies", href: "/companies" },
    { label: "Universities", href: "/universities" },
    { label: "How It Works", href: "/how-it-works" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Help Center", href: "/help" },
    { label: "FAQs", href: "/faqs" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socials = [
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  { icon: FaXTwitter, href: "#", label: "X (Twitter)" },
  { icon: FaGithub, href: "#", label: "GitHub" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="border-t border-surface-sand bg-coffee-dark text-text-inverse">
      {/* ---- Main Grid ---- */}
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Column */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="select-none">
            <h2 className="text-2xl font-heading font-bold tracking-tight !text-[#A8C5B8]">
              Stag.io
            </h2>
          </Link>
          <p className="text-sm leading-relaxed text-text-inverse/70">
            Connecting students, companies, and universities for seamless
            internship management.
          </p>

          <div className="mt-2 flex flex-col gap-2 text-sm text-text-inverse/60">
            <span className="flex items-center gap-2">
              <HiOutlineMail className="shrink-0" size={16} />
              contact@stag.io
            </span>
            <span className="flex items-center gap-2">
              <HiOutlineLocationMarker className="shrink-0" size={16} />
              constantine, Algeria
            </span>
          </div>
        </div>

        {/* Link Columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading} className="flex flex-col gap-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-coffee-gold">
              {heading}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ---- Bottom Bar ---- */}
      <div className="border-t border-text-inverse/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <p className="text-xs text-text-inverse/50">
            &copy; {new Date().getFullYear()} Stag.io — All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="rounded-full border border-text-inverse/20 p-2 text-text-inverse/60 transition-colors hover:border-coffee-gold hover:text-coffee-gold"
              >
                <s.icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
