'use client';

import { motion } from 'motion/react';
import type { ConsensusGap } from '@/types/consensus';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { FUNCTION_COLORS, FUNCTION_LABELS } from '@/lib/constants';

interface GapAnalysisProps {
  gaps: ConsensusGap[];
  selfScores: Record<CognitiveFunction, number>;
  othersScores: Record<CognitiveFunction, number>;
}

export function GapAnalysis({ gaps, selfScores, othersScores }: GapAnalysisProps) {
  if (gaps.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-sm text-muted">
          How you see yourself matches how others see you pretty well. No big differences found.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-4">
        How others see you differently
      </h3>
      <p className="text-sm text-muted mb-5">
        These are the areas where your friends' answers didn't match your own.
      </p>

      <div className="space-y-4">
        {gaps.map((gap, i) => (
          <motion.div
            key={gap.function}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl bg-surface/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: FUNCTION_COLORS[gap.function] }}
              />
              <span className="text-sm font-medium text-foreground">{gap.function}</span>
              <span className="text-xs text-muted">{FUNCTION_LABELS[gap.function]}</span>
              <span
                className={`ml-auto text-xs font-mono font-medium ${gap.delta > 0 ? 'text-teal-400' : 'text-rose-400'}`}
              >
                {gap.delta > 0 ? '+' : ''}{Math.round(gap.delta)}
              </span>
            </div>

            {/* Dual bars */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted w-12">You</span>
                <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: FUNCTION_COLORS[gap.function] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${gap.selfScore}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-sm font-mono text-muted w-8">
                  {Math.round(gap.selfScore)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted w-12">Friends</span>
                <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                  <motion.div
                    className="h-full rounded-full opacity-60"
                    style={{ backgroundColor: FUNCTION_COLORS[gap.function] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${gap.othersScore}%` }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-sm font-mono text-muted w-8">
                  {Math.round(gap.othersScore)}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted mt-2 leading-relaxed">
              {gap.interpretation}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
