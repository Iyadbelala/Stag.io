export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      {/* Logo */}
      <h1 className="text-6xl font-heading font-bold mb-4">
        <span className="text-coffee-dark">Stag</span>
        <span className="text-coffee-gold">.</span>
        <span className="text-logo-sage">io</span>
      </h1>

      {/* Tagline */}
      <p className="text-text-secondary text-lg mb-8 font-body">
        Your internship journey starts here.
      </p>

      {/* Test Buttons */}
      <div className="flex gap-4">
        <button className="bg-coffee-warm text-text-inverse px-6 py-3 rounded-button font-body font-medium hover:bg-coffee-gold transition-colors cursor-pointer">
          Get Started
        </button>
        <button className="border-2 border-coffee-warm text-coffee-warm px-6 py-3 rounded-button font-body font-medium hover:bg-coffee-warm hover:text-text-inverse transition-colors cursor-pointer">
          Learn More
        </button>
      </div>

      {/* Color Palette Preview */}
      <div className="mt-16 grid grid-cols-4 gap-4">
        <div className="w-20 h-20 rounded-card bg-coffee-dark" title="Dark Coffee" />
        <div className="w-20 h-20 rounded-card bg-coffee-warm" title="Warm Brown" />
        <div className="w-20 h-20 rounded-card bg-coffee-gold" title="Soft Gold" />
        <div className="w-20 h-20 rounded-card bg-surface-sand" title="Light Sand" />
      </div>

      <p className="mt-8 text-text-muted text-sm">
        Built by Iyed, Ouael &amp; Charaf — Atelier TI 2025-2026
      </p>
    </main>
  );
}
