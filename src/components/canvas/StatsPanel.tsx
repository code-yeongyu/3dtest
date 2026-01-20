'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type StatsImpl from 'stats.js';

export default function StatsPanel() {
  const statsRef = useRef<StatsImpl | null>(null);
  const [StatsClass, setStatsClass] = useState<typeof StatsImpl | null>(null);

  useEffect(() => {
    import('stats.js').then((mod) => {
      setStatsClass(() => mod.default);
    });
  }, []);

  useEffect(() => {
    if (!StatsClass) return;

    const stats = new StatsClass();
    stats.showPanel(0);
    stats.dom.style.position = 'fixed';
    stats.dom.style.left = '0px';
    stats.dom.style.top = '0px';
    stats.dom.style.zIndex = '9999';
    document.body.appendChild(stats.dom);
    statsRef.current = stats;

    return () => {
      if (stats.dom.parentNode) {
        stats.dom.parentNode.removeChild(stats.dom);
      }
    };
  }, [StatsClass]);

  useFrame(() => {
    if (statsRef.current) {
      statsRef.current.update();
    }
  });

  return null;
}
