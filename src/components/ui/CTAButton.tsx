'use client';

import { useAnimationStore } from '@/stores/animationStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function CTAButton() {
  const state = useAnimationStore((s) => s.state);
  const isReveal = state === 'REVEAL';

  return (
    <AnimatePresence>
      {isReveal && (
        <motion.div
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 transform"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{
            duration: 1.0,
            delay: 2.0, // Wait for RevealText animation (approx 2.5s)
            ease: 'easeOut',
          }}
        >
          <motion.a
            href="#"
            className="group relative flex items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-bold tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">GET STARTED</span>
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
