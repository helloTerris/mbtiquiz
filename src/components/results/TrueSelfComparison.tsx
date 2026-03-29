'use client';

import { motion } from 'motion/react';
import type { TrueSelfAnalysis } from '@/types/results';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { ALL_FUNCTIONS } from '@/types/cognitive-functions';
import { FUNCTION_COLORS, FUNCTION_LABELS } from '@/lib/constants';

interface TrueSelfComparisonProps {
  analysis: TrueSelfAnalysis;
}

export function TrueSelfComparison({ analysis }: TrueSelfComparisonProps) {
  const { naturalScores, adaptedScores, divergencePoints } = analysis;

  // Only show functions that have real data in both subsets and a visible difference
  const meaningfulFunctions = ALL_FUNCTIONS.filter((fn) => {
    const nat = naturalScores[fn];
    const adp = adaptedScores[fn];
    // Skip if both are effectively empty (no questions covered this)
    if (nat === 0 && adp === 0) return false;
    // Skip if the difference is tiny (less than 5 points — just noise)
    if (Math.abs(nat - adp) < 5) return false;
    return true;
  }).sort(
    (a, b) =>
      Math.abs(adaptedScores[b] - naturalScores[b]) -
      Math.abs(adaptedScores[a] - naturalScores[a])
  );

  // If nothing meaningful to show, don't render at all
  if (meaningfulFunctions.length === 0 && divergencePoints.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-1">
        The real you vs. how you act
      </h3>
      <p className="text-sm text-muted mb-5">
        Your natural tendencies compared to how you behave when life demands it.
      </p>

      {/* Per-function comparison — only functions with a visible difference */}
      {meaningfulFunctions.length > 0 && (
        <div className="space-y-4">
          {meaningfulFunctions.map((fn) => {
            const nat = Math.round(naturalScores[fn]);
            const adp = Math.round(adaptedScores[fn]);
            const diff = adp - nat;
            const color = FUNCTION_COLORS[fn];

            return (
              <div key={fn}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2.5 h-2.5 rounded-[3px]"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-semibold text-foreground">{fn}</span>
                  <span className="text-xs text-muted">{FUNCTION_LABELS[fn]}</span>
                  <span className={`text-xs font-mono ml-auto ${diff > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                </div>

                {/* Real you */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted w-14 text-right">Real you</span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color, opacity: 0.9 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${nat}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted w-7 text-right">{nat}</span>
                </div>

                {/* Daily you */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted w-14 text-right">Daily you</span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color, opacity: 0.5 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${adp}%` }}
                      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted w-7 text-right">{adp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Divergence explanations */}
      {divergencePoints.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-3">
            What this means
          </p>
          <div className="space-y-3">
            {divergencePoints.slice(0, 3).map((dp, i) => {
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
