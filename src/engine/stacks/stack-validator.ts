import type { NormalizedScores } from '@/types/scoring';
import type { StackMatch, StackGap, FunctionStack } from '@/types/stacks';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { VALID_STACKS } from './valid-stacks';
import { POSITION_WEIGHTS } from '@/lib/constants';

/**
 * Calculate how well a user's function scores match each of the 16 valid stacks.
 * Uses position-based fit scoring with penalties for rank mismatches.
 *
 * Key design decisions:
 * - Tertiary uses a RANGE (ranks 2-5) instead of a fixed expected rank,
 *   because tertiary development varies widely by age and experience.
 * - Dom-inf axis alignment is heavily weighted — it's the foundational
 *   Jungian rule, not a minor bonus.
 * - Quadratic penalty for dom/aux/inf (precise positions matter),
 *   linear penalty for tertiary (flexible position is expected).
 */

type StackPosition = 'dominant' | 'auxiliary' | 'tertiary' | 'inferior';

// Expected rank (0-indexed) for dom, aux, inf — tertiary uses a range instead
const EXPECTED_RANKS: Record<Exclude<StackPosition, 'tertiary'>, number> = {
  dominant: 0,   // should be #1
  auxiliary: 1,   // should be #2
  inferior: 7,    // should be last or near-last
};

// Tertiary has an acceptable range — no penalty if within this band
const TERTIARY_RANGE: [number, number] = [2, 5]; // ranks 3rd through 6th (0-indexed)

function calculatePositionFit(
  position: StackPosition,
  actualRank: number,
  weight: number
): number {
  if (position === 'tertiary') {
    // Linear penalty only for distance outside the acceptable range
    const [lo, hi] = TERTIARY_RANGE;
    if (actualRank >= lo && actualRank <= hi) return weight; // full credit
    const dist = actualRank < lo ? lo - actualRank : actualRank - hi;
    const penalty = dist * 4; // linear, not quadratic
    return Math.max(0, weight - penalty);
  }

  const expectedRank = EXPECTED_RANKS[position];
  const diff = Math.abs(expectedRank - actualRank);
  // Quadratic penalty for dom/aux/inf: off by 2 = 4x worse than off by 1
  const penalty = diff * diff * 3;
  return Math.max(0, weight - penalty);
}

function getGapSeverity(position: StackPosition, actualRank: number): 'minor' | 'moderate' | 'major' {
  if (position === 'tertiary') {
    const [lo, hi] = TERTIARY_RANGE;
    if (actualRank >= lo && actualRank <= hi) return 'minor';
    const dist = actualRank < lo ? lo - actualRank : actualRank - hi;
    if (dist <= 1) return 'minor';
    if (dist <= 2) return 'moderate';
    return 'major';
  }

  const expectedRank = EXPECTED_RANKS[position];
  const diff = Math.abs(expectedRank - actualRank);
  if (diff <= 1) return 'minor';
  if (diff <= 3) return 'moderate';
  return 'major';
}

/**
 * Score how well the dominant-inferior axis holds.
 * This is THE core Jungian constraint: dom and inf are on the same axis,
 * and inf should be weak when dom is strong.
 *
 * Returns a value that can be negative (penalty for inversions).
 */
function scoreAxisAlignment(
  stack: FunctionStack,
  rankings: CognitiveFunction[]
): number {
  const domRank = rankings.indexOf(stack.dominant);
  const infRank = rankings.indexOf(stack.inferior);

  // Ideal: dom is top (rank 0), inf is bottom (rank 7)
  // Measure by rank separation: infRank - domRank (max 7, min -7)
  const separation = infRank - domRank;

  if (separation >= 5) return 25;  // strong axis: inf is far below dom
  if (separation >= 3) return 15;  // decent axis
  if (separation >= 1) return 5;   // mild axis
  if (separation === 0) return -10; // dom and inf tied — bad sign
  // Negative separation means inferior ranks ABOVE dominant — axis inversion
  return -20 + (separation * 5);   // severe penalty, scales with inversion degree
}

export function matchToStacks(normalizedScores: NormalizedScores): StackMatch[] {
  const { rankings } = normalizedScores;
  const matches: StackMatch[] = [];

  for (const stack of VALID_STACKS) {
    const gaps: StackGap[] = [];
    let fitScore = 0;

    const positions: { pos: StackPosition; fn: CognitiveFunction }[] = [
      { pos: 'dominant', fn: stack.dominant },
      { pos: 'auxiliary', fn: stack.auxiliary },
      { pos: 'tertiary', fn: stack.tertiary },
      { pos: 'inferior', fn: stack.inferior },
    ];

    for (const { pos, fn } of positions) {
      const actualRank = rankings.indexOf(fn);
      const weight = POSITION_WEIGHTS[pos];

      fitScore += calculatePositionFit(pos, actualRank, weight);

      const expectedRank = pos === 'tertiary'
        ? Math.round((TERTIARY_RANGE[0] + TERTIARY_RANGE[1]) / 2) // midpoint for gap reporting
        : EXPECTED_RANKS[pos];

      const severity = getGapSeverity(pos, actualRank);
      if (severity !== 'minor') {
        gaps.push({
          position: pos,
          expected: fn,
          expectedRank,
          actualRank,
          severity,
        });
      }
    }

    // Axis alignment: heavily weighted, can penalize inversions
    fitScore += scoreAxisAlignment(stack, rankings);

    // Attitude alternation bonus: dom and aux have opposite introversion/extraversion
    const domIsIntro = stack.dominant.endsWith('i');
    const auxIsIntro = stack.auxiliary.endsWith('i');
    if (domIsIntro !== auxIsIntro) fitScore += 5;

    matches.push({
      type: stack.type,
      stack,
      fitScore,
      confidence: 0, // calculated later
      probability: 0, // calculated later
      gaps,
    });
  }

  // Normalize fit scores to 0-100
  const maxFit = Math.max(...matches.map((m) => m.fitScore), 1);
  for (const match of matches) {
    match.fitScore = (match.fitScore / maxFit) * 100;
  }

  // Bayesian probability: P(type|scores) proportional to fitScore^2
  const totalFitSquared = matches.reduce((sum, m) => sum + m.fitScore ** 2, 0);
  for (const match of matches) {
    match.probability = totalFitSquared > 0 ? match.fitScore ** 2 / totalFitSquared : 0;
  }

  // Sort by fit score descending
  matches.sort((a, b) => b.fitScore - a.fitScore);

  return matches;
}
