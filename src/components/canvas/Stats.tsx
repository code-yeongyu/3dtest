'use client';

import dynamic from 'next/dynamic';

const StatsPanel = dynamic(() => import('./StatsPanel'), {
  ssr: false,
});

const isDev = process.env.NODE_ENV === 'development';

export default function Stats() {
  if (!isDev) {
    return null;
  }

  return <StatsPanel />;
}
