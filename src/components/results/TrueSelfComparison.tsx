'use client';

import { motion } from 'motion/react';
import type { TrueSelfAnalysis } from '@/types/results';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { QUESTION_PAIRS } from '@/types/cognitive-functions';
import { FUNCTION_COLORS, FUNCTION_LABELS } from '@/lib/constants';

interface TrueSelfComparisonProps {
  analysis: TrueSelfAnalysis;
}

export function TrueSelfComparison({ analysis }: TrueSelfComparisonProps) {
  const { naturalScores, adaptedScores, divergencePoints } = analysis;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-1">
        The real you vs. how you act
      </h3>
      <p className="text-sm text-muted mb-5">
        Your natural tendencies compared to how you behave when life demands it.
      </p>

      {/* Dual bar comparison for each function pair */}
      <div className="space-y-5">
        {QUESTION_PAIRS.map(([fnA, fnB]) => (
          <div key={`${fnA}-${fnB}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono text-muted">{fnA} vs {fnB}</span>
            </div>

            {/* Natural */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted w-16 text-right">Natural</span>
              <div className="flex-1 flex h-1.5 rounded-full bg-surface overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: FUNCTION_COLORS[fnA], opacity: 0.9 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${naturalScores[fnA]}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-mono text-muted w-8">
                {Math.round(naturalScores[fnA])}
              </span>
            </div>

            {/* Adapted */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted w-16 text-right">Adapted</span>
              <div className="flex-1 flex h-1.5 rounded-full bg-surface overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: FUNCTION_COLORS[fnA], opacity: 0.5 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${adaptedScores[fnA]}%` }}
                  transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-mono text-muted w-8">
                {Math.round(adaptedScores[fnA])}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Divergence points */}
      {divergencePoints.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-3">
            Biggest gaps between real you and daily you
          </p>
          <div className="space-y-3">
            {divergencePoints.slice(0, 3).map((dp, i) => {
              const gap = Math.abs(dp.naturalScore - dp.adaptedScore);
              const direction = dp.adaptedScore > dp.naturalScore ? 'up' : 'down';

              return (
                <motion.div
                  key={dp.function}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-xl bg-surface/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: FUNCTION_COLORS[dp.function] }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {dp.function}
                    </span>
                    <span className="text-xs text-muted">
                      {FUNCTION_LABELS[dp.function]}
                    </span>
                    <span className={`text-xs font-mono ml-auto ${direction === 'up' ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {direction === 'up' ? '+' : ''}{Math.round(dp.adaptedScore - dp.naturalScore)}
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {dp.possibleCause}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
