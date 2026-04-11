"use client";

export function CompanyAvatar({ name, logoUrl, size = "md" }: { name: string; logoUrl?: string | null; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-10 w-10 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${dim} shrink-0 rounded-xl object-cover border border-surface-sand shadow-sm`}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    "from-coffee-warm to-coffee-gold",
    "from-amber-600 to-orange-400",
    "from-emerald-600 to-teal-400",
    "from-blue-600 to-cyan-400",
    "from-purple-600 to-pink-400",
    "from-rose-600 to-red-400",
    "from-indigo-600 to-violet-400",
  ];
  const colorIdx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

  return (
    <div className={`${dim} shrink-0 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}
