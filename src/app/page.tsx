'use client';

import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import MainCanvas from '@/components/canvas/MainCanvas';
import AnimationSyncer from '@/components/canvas/AnimationSyncer';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import CTAButton from '@/components/ui/CTAButton';
import Fallback from '@/components/ui/Fallback';

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
      <div className="fixed inset-0 z-0">
        <MainCanvas />
      </div>
      <main className="relative z-10 h-[500vh]">
        <ScrollIndicator />
        <CTAButton />
      </main>
    </>
  );
}
