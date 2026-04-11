"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

/* ============================================
   Scroll-triggered animation wrapper
   Uses IntersectionObserver for performance
   ============================================ */

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Animation variant */
  variant?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom" | "fade";
  /** Delay in ms */
  delay?: number;
  /** Duration in ms */
  duration?: number;
  /** Trigger threshold (0-1) */
  threshold?: number;
  /** Only animate once */
  once?: boolean;
}

export function Reveal({
  children,
  className = "",
  variant = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.15,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const transforms: Record<string, string> = {
    "fade-up": "translateY(40px)",
    "fade-down": "translateY(-40px)",
    "fade-left": "translateX(40px)",
    "fade-right": "translateX(-40px)",
    zoom: "scale(0.9)",
    fade: "none",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : transforms[variant],
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ============================================
   Stagger container — staggers children reveals
   ============================================ */

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  variant?: RevealProps["variant"];
  duration?: number;
  threshold?: number;
}

export function Stagger({
  children,
  className = "",
  stagger = 100,
  variant = "fade-up",
  duration = 600,
  threshold = 0.1,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const transforms: Record<string, string> = {
    "fade-up": "translateY(40px)",
    "fade-down": "translateY(-40px)",
    "fade-left": "translateX(40px)",
    "fade-right": "translateX(-40px)",
    zoom: "scale(0.9)",
    fade: "none",
  };

  const items = Array.isArray(children) ? children : [children];

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : transforms[variant],
            transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${i * stagger}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${i * stagger}ms`,
            willChange: "opacity, transform",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/* ============================================
   Animated Counter — counts from 0 to target
   ============================================ */

interface CounterProps {
  target: string; // e.g. "2,500+"
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ target, className = "", duration = 2000 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [display, setDisplay] = useState("0");

  // Parse the numeric part
  const numericStr = target.replace(/[^0-9]/g, "");
  const numericValue = parseInt(numericStr, 10);
  const suffix = target.replace(/[0-9,]/g, ""); // e.g. "+"

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const startTime = performance.now();
    let raf: number;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numericValue);
      setDisplay(current.toLocaleString());

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hasAnimated, numericValue, duration]);

  return (
    <span ref={ref} className={className}>
      {display}{suffix}
    </span>
  );
}

/* ============================================
   Floating Particles — decorative background
   ============================================ */

export function FloatingParticles({ count = 20, className = "" }: { count?: number; className?: string }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-coffee-gold"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================
   Magnetic hover effect wrapper
   ============================================ */

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className = "", strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "translate(0, 0)";
      ref.current.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    }
  };

  const handleMouseEnter = () => {
    if (ref.current) {
      ref.current.style.transition = "transform 0.15s ease-out";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </div>
  );
}

/* ============================================
   Text shimmer effect
   ============================================ */

export function TextShimmer({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`animate-text-shimmer bg-[length:200%_100%] bg-clip-text text-transparent bg-gradient-to-r from-coffee-dark via-coffee-gold to-coffee-dark ${className}`}>
      {text}
    </span>
  );
}

/* ============================================
   Tilt Card — 3D tilt on hover
   ============================================ */

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ children, className = "", maxTilt = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
