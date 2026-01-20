'use client';

import { useScrollProgress, PHASE_NAMES } from '@/hooks/useScrollProgress';

export default function ScrollIndicator() {
  const { progress, phase, phaseProgress } = useScrollProgress();

  return (
    <div className="pointer-events-none fixed bottom-8 left-8 z-50 rounded-lg bg-black/70 p-4 font-mono text-sm text-white backdrop-blur-sm">
      <div className="mb-2 text-xs uppercase tracking-wider text-gray-400">Scroll Progress</div>
      <div className="mb-3">
        <div className="mb-1 flex justify-between">
          <span>Global</span>
          <span>{(progress * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <div className="mb-3">
        <div className="mb-1 flex justify-between">
          <span>
            Phase {phase}: {PHASE_NAMES[phase]}
          </span>
          <span>{(phaseProgress * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-100"
            style={{ width: `${phaseProgress * 100}%` }}
          />
        </div>
      </div>
      <div className="flex gap-1">
        {PHASE_NAMES.map((name, i) => (
          <div
            key={name}
            className={`flex-1 rounded px-1 py-0.5 text-center text-xs transition-colors ${
              i === phase ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'
            }`}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
