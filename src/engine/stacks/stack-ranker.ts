import type { StackMatch } from '@/types/stacks';

/**
 * Rank stack matches and compute confidence for the top result.
 */
export function rankStacks(matches: StackMatch[]): StackMatch[] {
  // Already sorted by matchToStacks, but add confidence
  if (matches.length < 2) return matches;

  const top = matches[0];
  const runnerUp = matches[1];

  // Confidence based on margin between #1 and #2
  const margin = top.fitScore - runnerUp.fitScore;
  // 20+ point gap = very confident, <5 point gap = low confidence
  top.confidence = Math.min(100, margin * 5);

  // Also assign confidence to alternatives
  for (let i = 1; i < matches.length; i++) {
    matches[i].confidence = Math.max(0, matches[i].fitScore - 10);
  }

  return matches;
}
