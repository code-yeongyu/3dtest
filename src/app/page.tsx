'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import AnimationSyncer from '@/components/canvas/AnimationSyncer';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import CTAButton from '@/components/ui/CTAButton';
import Fallback from '@/components/ui/Fallback';

// Dynamic import for heavy 3D components - reduces initial bundle
const MainCanvas = dynamic(() => import('@/components/canvas/MainCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a]">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
    </div>
  ),
});

export default function Home() {
  const { isSupported, isLoading } = useWebGLSupport();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </div>
    );
  }

  if (!isSupported) {
    return <Fallback />;
  }

  return (
    <>
      <AnimationSyncer />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a]">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          </div>
        }>
          <MainCanvas />
        </Suspense>
      </div>
      <main className="relative z-10 h-[500vh] pointer-events-auto">
        <ScrollIndicator />
        <CTAButton />
      </main>
    </>
  );
}
