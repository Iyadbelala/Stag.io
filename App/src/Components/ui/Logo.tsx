import Link from "next/link";

interface LogoProps {
  /** Tailwind text-size class, e.g. "text-2xl" */
  size?: string;
  /** Use light (inverse) colors for dark backgrounds */
  variant?: "default" | "light";
}

export default function Logo({
  size = "text-2xl",
  variant = "default",
}: LogoProps) {
  const mainColor =
    variant === "light" ? "text-text-inverse!" : "text-coffee-dark";

  return (
    <Link href="/" className="inline-block select-none">
      <span className={`font-heading ${size} font-bold tracking-tight`}>
        <span className={mainColor}>Stag</span>
        <span className="text-coffee-gold">.</span>
        <span className="text-logo-sage">io</span>
      </span>
    </Link>
  );
}
