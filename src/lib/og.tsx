import { ImageResponse } from 'next/og';

export function getOGImage(opts: { title?: string; subtitle?: string; footer?: string } = {}) {
  const {
    title = 'Muhammad Nabil Al Qadri',
    subtitle = 'Software Engineering Student',
    footer = 'Al-Qadri',
  } = opts;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0D090A',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #351312 0%, #0D090A 70%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#F1ECE8',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '32px',
              color: '#C38268',
            }}
          >
            {subtitle}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            fontSize: '24px',
            color: '#B9B2B0',
          }}
        >
          {footer}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
