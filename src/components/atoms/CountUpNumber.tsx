'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpNumberProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function CountUpNumber({ end, duration = 2000, suffix = '', className }: CountUpNumberProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // No animation - show final value immediately
      setCount(end);
      setHasAnimated(true);
      return;
    }
    
    // Intersection Observer to trigger animation when visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          animateCount();
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(element);
    
    function animateCount() {
      const startTime = performance.now();
      
      function update(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeOut * end);
        
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setCount(end);
          setHasAnimated(true);
        }
      }
      
      requestAnimationFrame(update);
    }
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [end, duration, hasAnimated]);
  
  return (
    <span ref={elementRef} className={className} aria-live="polite">
      {count}{suffix}
    </span>
  );
}
