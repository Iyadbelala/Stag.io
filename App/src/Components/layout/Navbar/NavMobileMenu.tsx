"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Components/contexts/AuthContext";
import { useLanguage } from "@/Components/contexts/LanguageContext";

interface NavLink {
  labelKey: string;
  href: string;
}

interface NavMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
}

function getDashboardHref(role: string) {
  if (role === "company") return "/company";
  if (role === "admin") return "/admin";
  if (role === "superadmin") return "/superadmin";
  if (role === "university") return "/university";
  return "/student";
}

function getDisplayName(user: { role: string; companyName?: string; universityName?: string; firstName?: string; lastName?: string; email: string }) {
  if (user.role === "company") return user.companyName;
  if (user.role === "university") return user.universityName;
  return `${user.firstName} ${user.lastName}`;
}

export default function NavMobileMenu({ isOpen, onClose, navLinks }: NavMobileMenuProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/login");
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="flex flex-col gap-4 border-t border-surface-sand bg-surface-white px-6 py-6">
        {navLinks
          .filter((link) => !(user && link.href === "/"))
          .map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-coffee-dark"
          >
            {t(link.labelKey)}
          </Link>
        ))}

        <hr className="border-surface-sand" />

        <div className="flex flex-col gap-3">
          {user ? (
            <>
              <div className="px-1 py-1">
                <p className="text-sm font-medium text-coffee-dark">
                  {getDisplayName(user)}
                </p>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
              <Link
                href={getDashboardHref(user.role)}
                onClick={onClose}
                className="rounded-button border-2 border-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
              >
                Dashboard
              </Link>
              {(user.role === "student" || user.role === "company") && (
                <Link
                  href="/reviews"
                  onClick={onClose}
                  className="rounded-button border-2 border-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
                >
                  Reviews
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="rounded-button bg-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-text-inverse transition-colors hover:bg-coffee-gold cursor-pointer"
              >
                {t("nav.signOut")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="rounded-button border-2 border-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="rounded-button bg-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-text-inverse transition-colors hover:bg-coffee-gold"
              >
                {t("nav.getStarted")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
