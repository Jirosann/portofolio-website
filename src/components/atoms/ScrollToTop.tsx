'use client';

import { useEffect } from 'react';

export function ScrollToTop() {
  useEffect(() => {
    // Override default browser scroll restoration on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Immediately scroll to the top
    window.scrollTo(0, 0);

    // Optional cleanup (usually not needed for this specific feature)
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  return null;
}
