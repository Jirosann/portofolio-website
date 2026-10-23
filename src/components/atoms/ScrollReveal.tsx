"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

type RevealState = "visible" | "hidden" | "shown";

// Render awal (SSR dan tanpa JavaScript) = "visible": konten tidak pernah tersembunyi.
// Setelah mount, hanya elemen yang masih di bawah layar disembunyikan lalu ditampilkan
// SEKALI saat masuk viewport. Layar sentuh dan reduced-motion tidak dianimasikan sama sekali.
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const [state, setState] = useState<RevealState>("visible");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const skip =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      typeof IntersectionObserver === "undefined";
    if (skip) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) return; // sudah terlihat / di atas viewport

    setState("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        state === "hidden" && "reveal-hidden",
        state === "shown" && "reveal-in",
        className
      )}
      style={state === "shown" && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
