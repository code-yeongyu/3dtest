'use client';

import { useCallback, useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { audioManager, type AudioManagerState } from '@/lib/audioManager';

export default function AudioControls() {
  const [audioState, setAudioState] = useState<AudioManagerState>(() => audioManager.getState());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    return audioManager.subscribe(setAudioState);
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (!audioState.isUserInteracted) {
      audioManager.init();
    }
    audioManager.toggleMute();
  }, [audioState.isUserInteracted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    audioManager.setVolume(value);
  }, []);

  const handleContainerClick = useCallback(() => {
    if (!audioState.isUserInteracted) {
      audioManager.init();
    }
  }, [audioState.isUserInteracted]);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={handleContainerClick}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md"
            initial={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }}
            animate={{ opacity: 1, width: 'auto', paddingLeft: 16, paddingRight: 16 }}
            exit={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={audioState.volume}
              onChange={handleVolumeChange}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              aria-label="Volume"
            />
            <span className="min-w-[2.5rem] text-xs text-white/60">
              {Math.round(audioState.volume * 100)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleMuteToggle}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-black/60"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={audioState.isMuted ? 'Unmute' : 'Mute'}
      >
        {audioState.isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
      </motion.button>
    </motion.div>
  );
}

function VolumeOnIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}
