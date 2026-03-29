import type { CognitiveFunction } from '@/types/cognitive-functions';
import { ALL_FUNCTIONS } from '@/types/cognitive-functions';
import type { ConsensusGap } from '@/types/consensus';
import { FUNCTION_LABELS } from '@/lib/constants';

const GAP_THRESHOLD = 10; // Minimum difference to flag

/**
 * Analyze gaps between self-perception and how others see you.
 */
export function analyzeGaps(
  selfScores: Record<CognitiveFunction, number>,
  othersScores: Record<CognitiveFunction, number>
): ConsensusGap[] {
  const gaps: ConsensusGap[] = [];

  for (const fn of ALL_FUNCTIONS) {
    const delta = othersScores[fn] - selfScores[fn];
    if (Math.abs(delta) < GAP_THRESHOLD) continue;

    const label = FUNCTION_LABELS[fn] || fn;
    const direction = delta > 0 ? 'more' : 'less';

    gaps.push({
      function: fn,
      selfScore: selfScores[fn],
      othersScore: othersScores[fn],
      delta,
      interpretation: `Others see you as ${direction} ${label} (${fn})-oriented than you see yourself (${Math.abs(Math.round(delta))} point gap).`,
    });
  }

  // Sort by absolute delta descending
  gaps.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return gaps;
}
