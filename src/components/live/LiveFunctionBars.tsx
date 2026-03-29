'use client';

import { motion } from 'motion/react';
import { FUNCTION_COLORS } from '@/lib/constants';
import type { NormalizedScores } from '@/types/scoring';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { QUESTION_PAIRS } from '@/types/cognitive-functions';

interface LiveFunctionBarsProps {
  normalizedScores: NormalizedScores | null;
  className?: string;
}

export function LiveFunctionBars({ normalizedScores, className }: LiveFunctionBarsProps) {
  if (!normalizedScores) return null;

  return (
    <div className={className}>
      <p className="text-sm text-muted uppercase tracking-[0.1em] mb-3 font-mono">
        Live Scores
      </p>
      <div className="space-y-3.5">
        {QUESTION_PAIRS.map(([fnA, fnB]) => (
          <FunctionPairBar
            key={`${fnA}-${fnB}`}
            fnA={fnA}
            fnB={fnB}
            scoreA={normalizedScores.pairNormalized[fnA]}
            scoreB={normalizedScores.pairNormalized[fnB]}
          />
        ))}
      </div>
    </div>
  );
}

function FunctionPairBar({
  fnA,
  fnB,
  scoreA,
  scoreB,
}: {
  fnA: CognitiveFunction;
  fnB: CognitiveFunction;
  scoreA: number;
  scoreB: number;
}) {
  const leading = scoreA >= scoreB ? fnA : fnB;
  const leadingScore = Math.max(scoreA, scoreB);
  const leadingColor = FUNCTION_COLORS[leading];

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span
          className="text-sm font-mono font-semibold"
          style={{ color: leadingColor }}
        >
          {leading}
        </span>
        <span className="text-sm text-muted font-mono tabular-nums">
          {Math.round(leadingScore)}%
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-surface overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            backgroundColor: FUNCTION_COLORS[fnA],
            boxShadow: scoreA > 60 ? `0 0 6px ${FUNCTION_COLORS[fnA]}30` : 'none',
          }}
          initial={{ width: '50%' }}
          animate={{ width: `${scoreA}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute top-0 right-0 h-full rounded-full"
          style={{ backgroundColor: FUNCTION_COLORS[fnB] }}
          initial={{ width: '50%' }}
          animate={{ width: `${scoreB}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-xs text-muted font-mono">{fnA}</span>
        <span className="text-xs text-muted font-mono">{fnB}</span>
      </div>
    </div>
  );
}
