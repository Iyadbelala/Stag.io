import Link from "next/link";
import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import { FaLinkedinIn, FaXTwitter, FaGithub, FaInstagram } from "react-icons/fa6";
import Logo from "@/Components/Logo";

export default function Footer() {
  return (
    <footer className="bg-coffee-dark dark-section">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top — Brand + Nav */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Logo variant="light" />
            <p className="max-w-xs text-sm leading-relaxed text-text-inverse/70">
              Connecting students, companies, and universities for seamless
              internship management.
            </p>
            <div className="mt-1 flex flex-col gap-1.5 text-sm text-text-inverse/50">
              <span className="flex items-center gap-2">
                <HiOutlineMail size={14} />
                contact@stag.io
              </span>
              <span className="flex items-center gap-2">
                <HiOutlineLocationMarker size={14} />
                Constantine, Algeria
              </span>
            </div>
          </div>

          {/* Platform */}
          <nav className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-coffee-gold">
              Platform
            </span>
            <Link href="/internships" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">Internships</Link>
            <Link href="/companies" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">Companies</Link>
            <Link href="/universities" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">Universities</Link>
            <Link href="/how-it-works" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">How It Works</Link>
          </nav>

          {/* Resources */}
          <nav className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-coffee-gold">
              Resources
            </span>
            <Link href="/blog" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">Blog</Link>
            <Link href="/help" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">Help Center</Link>
            <Link href="/faqs" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">FAQs</Link>
            <Link href="/contact" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">Contact</Link>
          </nav>

          {/* Legal */}
          <nav className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-coffee-gold">
              Legal
            </span>
            <Link href="/privacy" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">Terms of Service</Link>
            <Link href="/cookies" className="text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold">Cookie Policy</Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-text-inverse/10" />

        {/* Bottom — Copyright + Socials */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-text-inverse/40">
            &copy; {new Date().getFullYear()} Stag.io — All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: FaLinkedinIn, label: "LinkedIn" },
              { icon: FaXTwitter, label: "X" },
              { icon: FaGithub, label: "GitHub" },
              { icon: FaInstagram, label: "Instagram" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-full border border-text-inverse/15 p-2 text-text-inverse/40 transition-colors hover:border-coffee-gold hover:text-coffee-gold"
              >
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
