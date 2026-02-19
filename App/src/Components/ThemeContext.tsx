"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

/* ============================================
   Types
   ============================================ */
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: (e: React.MouseEvent) => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  toggleRef: { current: null },
});

export const useTheme = () => useContext(ThemeContext);

/* ============================================
   Provider
   ============================================ */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* ---- Hydrate from localStorage ---- */
  useEffect(() => {
    const stored = localStorage.getItem("stag-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (!stored && prefersDark);

    if (shouldBeDark) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
    setMounted(true);
  }, []);

  /* ---- Toggle with explosion animation ---- */
  const toggleTheme = useCallback(
    (e: React.MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const newIsDark = !isDark;

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      /* ---- Modern: View Transitions API ---- */
      const root = document.documentElement;
      const supportsVT = "startViewTransition" in document;

      if (supportsVT) {
        const transition = (document as any).startViewTransition(() => {
          root.classList.toggle("dark", newIsDark);
          setIsDark(newIsDark);
          localStorage.setItem("stag-theme", newIsDark ? "dark" : "light");
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 700,
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        });

        return;
      }

      /* ---- Fallback: clip-path overlay ---- */
      const overlay = overlayRef.current;
      if (!overlay) {
        // Absolute fallback — instant switch
        root.classList.toggle("dark", newIsDark);
        setIsDark(newIsDark);
        localStorage.setItem("stag-theme", newIsDark ? "dark" : "light");
        return;
      }

      overlay.style.backgroundColor = newIsDark ? "#1A1A2E" : "#F5EFE6";
      overlay.style.transition = "none";
      overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      overlay.style.display = "block";

      requestAnimationFrame(() => {
        overlay.style.transition =
          "clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
        overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
      });

      const onEnd = () => {
        root.classList.toggle("dark", newIsDark);
        setIsDark(newIsDark);
        localStorage.setItem("stag-theme", newIsDark ? "dark" : "light");
        overlay.style.transition = "none";
        overlay.style.display = "none";
      };

      overlay.addEventListener("transitionend", onEnd, { once: true });
      // Safety timeout
      setTimeout(onEnd, 800);
    },
    [isDark],
  );

  /* ---- Prevent flash of wrong theme ---- */
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, toggleRef }}>
      {children}

      {/* Fallback explosion overlay (for browsers without View Transitions API) */}
      <div
        ref={overlayRef}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          pointerEvents: "none",
          display: "none",
        }}
      />
    </ThemeContext.Provider>
  );
}
