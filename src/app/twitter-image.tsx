import { getOGImage } from '@/lib/og';

export const alt = 'Muhammad Nabil Al Qadri - Software Engineering Student';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return getOGImage();
}
