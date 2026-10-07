"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface AnimatedUnderlineProps {
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedUnderline({ className, style }: AnimatedUnderlineProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Trigger animation every time it comes into view (as requested by user)
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={clsx(
        "transition-all duration-700 ease-in-out origin-left",
        isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
        className
      )}
      style={style}
    ></div>
  );
}
