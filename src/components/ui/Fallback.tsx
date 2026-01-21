'use client';

import { motion } from 'framer-motion';

export default function Fallback() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-900/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-900/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.div
          className="relative mb-8 h-48 w-48"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M20 180 L100 40 L180 180 Z"
              fill="url(#mountainGradient)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="85"
              cy="100"
              r="18"
              fill="url(#boulderGradient)"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                cy: [100, 95, 100],
              }}
              transition={{
                opacity: { duration: 0.5, delay: 1 },
                cy: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <circle cx="75" cy="85" r="6" fill="#d4af37" />
              <path d="M75 91 L75 110 M75 95 L65 105 M75 95 L85 100 M75 110 L68 125 M75 110 L82 125" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
            </motion.g>
            <defs>
              <linearGradient id="mountainGradient" x1="100" y1="40" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4a4a6a" />
                <stop offset="100%" stopColor="#1a1a2e" />
              </linearGradient>
              <radialGradient id="boulderGradient" cx="0.3" cy="0.3" r="0.7">
                <stop offset="0%" stopColor="#8b7355" />
                <stop offset="100%" stopColor="#4a3728" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.h1
          className="mb-4 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-5xl font-bold tracking-wider text-transparent md:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          OlympusCode
        </motion.h1>

        <motion.p
          className="mb-8 text-xl font-light tracking-widest text-white/80 md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Code like a god
        </motion.p>

        <motion.div
          className="mb-12 max-w-lg text-base leading-relaxed text-white/60 md:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <p>
            Like Sisyphus pushing his boulder up the mountain, we persist through every challenge.
            Each line of code, each iteration, brings us closer to the summit.
          </p>
          <p className="mt-4 text-sm text-white/40">
            The eternal struggle becomes our strength. The journey is the reward.
          </p>
        </motion.div>

        <motion.a
          href="#"
          className="group relative flex items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-bold tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10">GET STARTED</span>
          <motion.div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        </motion.a>

        <motion.p
          className="mt-8 text-xs text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          For the full 3D experience, please use a WebGL-compatible browser.
        </motion.p>
      </motion.div>
    </div>
  );
}
