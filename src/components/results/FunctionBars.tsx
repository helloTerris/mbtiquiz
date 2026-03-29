'use client';

import { motion } from 'motion/react';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { FUNCTION_COLORS, FUNCTION_LABELS } from '@/lib/constants';

interface FunctionBarsProps {
  scores: Record<CognitiveFunction, number>;
  rankings: CognitiveFunction[];
}

export function FunctionBars({ scores, rankings }: FunctionBarsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-1">
        Your mental strengths
      </h3>
      <p className="text-xs text-muted mb-5">How strongly each thinking style showed up in your answers</p>
      {rankings.map((fn, i) => {
        const score = scores[fn];
        const color = FUNCTION_COLORS[fn];

        return (
          <motion.div
            key={fn}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + i * 0.04, duration: 0.35, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-[3px]"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-semibold text-foreground tracking-tight">{fn}</span>
                <span className="text-sm text-muted hidden sm:inline">
                  {FUNCTION_LABELS[fn]}
                </span>
              </div>
              <span className="text-sm font-mono text-muted tabular-nums">
                {Math.round(score)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface overflow-hidden">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  backgroundColor: color,
                  boxShadow: score > 50 ? `0 0 12px ${color}30` : 'none',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ delay: 0.15 + i * 0.04, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
