"use client";

import { useRef } from "react";

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const ORB_COLORS = [
  "rgba(200,169,106,0.15)", // gold
  "rgba(122,78,58,0.12)",   // warm
  "rgba(125,139,117,0.12)", // sage
  "rgba(200,169,106,0.10)", // gold faint
  "rgba(75,46,43,0.08)",    // dark
];

function generateOrbs(count: number): Orb[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 60 + Math.random() * 180,
    duration: 12 + Math.random() * 18,
    delay: Math.random() * -20,
    color: ORB_COLORS[i % ORB_COLORS.length],
  }));
}

interface FloatingOrbsProps {
  /** How many orbs to render (default 8) */
  count?: number;
}

export default function FloatingOrbs({ count = 8 }: FloatingOrbsProps) {
  const orbsRef = useRef<Orb[]>(generateOrbs(count));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbsRef.current.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            filter: "blur(40px)",
            animation: `float-orb ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
