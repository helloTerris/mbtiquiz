import type { CognitiveFunction } from '@/types/cognitive-functions';
import { ALL_FUNCTIONS, QUESTION_PAIRS } from '@/types/cognitive-functions';
import type { RawScores, NormalizedScores } from '@/types/scoring';

/**
 * Normalize scores within each axis pair (Ti vs Te, Fi vs Fe, etc.)
 * to measure RELATIVE PREFERENCE, not absolute enthusiasm.
 * Also compute global ranking across all 8 functions.
 */
export function normalize(raw: RawScores): NormalizedScores {
  // Pair normalization: within each opposition pair, scale to 0-100
  const pairNormalized: Record<string, number> = {};

  for (const [funcA, funcB] of QUESTION_PAIRS) {
    const total = raw.scores[funcA] + raw.scores[funcB];
    if (total === 0) {
      pairNormalized[funcA] = 50;
      pairNormalized[funcB] = 50;
    } else {
      pairNormalized[funcA] = (raw.scores[funcA] / total) * 100;
      pairNormalized[funcB] = (raw.scores[funcB] / total) * 100;
    }
  }

  // Global normalization: scale all 8 functions relative to the highest scorer
  const globalNormalized: Record<string, number> = {};
  const maxScore = Math.max(...ALL_FUNCTIONS.map(fn => raw.scores[fn]), 1);

  for (const fn of ALL_FUNCTIONS) {
    globalNormalized[fn] = (raw.scores[fn] / maxScore) * 100;
  }

  // Rankings: sort by global normalized score, descending
  const rankings = [...ALL_FUNCTIONS].sort(
    (a, b) => globalNormalized[b] - globalNormalized[a]
  );

  return {
    pairNormalized: pairNormalized as Record<CognitiveFunction, number>,
    globalNormalized: globalNormalized as Record<CognitiveFunction, number>,
    rankings,
  };
}

/**
 * Detect ambiguous function pairs where the gap is below threshold.
 */
export function detectAmbiguousPairs(
  normalized: NormalizedScores,
  threshold: number = 12
): [CognitiveFunction, CognitiveFunction][] {
  const ambiguous: [CognitiveFunction, CognitiveFunction][] = [];

  for (const [funcA, funcB] of QUESTION_PAIRS) {
    const gap = Math.abs(
      normalized.pairNormalized[funcA] - normalized.pairNormalized[funcB]
    );
    if (gap < threshold) {
      ambiguous.push([funcA, funcB]);
    }
  }

  return ambiguous;
}
