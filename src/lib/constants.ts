// Design tokens and constants from PRD Section 8

export const BREAKPOINTS = {
  mobile: 320,
  mobileLarge: 375,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
} as const;

export const SPACING = {
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  32: '32px',
  40: '40px',
  48: '48px',
  64: '64px',
  80: '80px',
  96: '96px',
} as const;



export const LAYOUT = {
  maxWidth: '1152px',
  paddingMobile: '20px',
  sectionSpacingMobile: '64px',
  sectionSpacingDesktop: '96px',
  cardRadius: '12px',
} as const;

export const TRANSITIONS = {
  default: '150ms',
  medium: '200ms',
} as const;

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.warn('WARNING: NEXT_PUBLIC_SITE_URL is not set for production build. Using http://localhost:3000 as fallback.');
  }
  return 'http://localhost:3000';
}
