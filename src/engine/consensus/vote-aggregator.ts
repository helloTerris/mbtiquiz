import type { CognitiveFunction } from '@/types/cognitive-functions';
import { ALL_FUNCTIONS, createEmptyScores } from '@/types/cognitive-functions';
import type { ConsensusSession } from '@/types/consensus';
import type { QuizResult } from '@/types/results';

/**
 * Aggregate self scores (50%) and others' scores (50%) into a combined profile.
 */
export function aggregateScores(
  selfScores: Record<CognitiveFunction, number>,
  session: ConsensusSession
): Record<CognitiveFunction, number> {
  if (session.votes.length === 0) return selfScores;

  // Average all voter scores
  const othersAvg = createEmptyScores();
  for (const vote of session.votes) {
    for (const fn of ALL_FUNCTIONS) {
      othersAvg[fn] += vote.scores[fn] / session.votes.length;
    }
  }

  // 50/50 blend
  const aggregated = createEmptyScores();
  for (const fn of ALL_FUNCTIONS) {
    aggregated[fn] = selfScores[fn] * 0.5 + othersAvg[fn] * 0.5;
  }

  return aggregated;
}

/**
 * Get only the average of others' scores (for comparison display).
 */
export function getOthersAverage(
  session: ConsensusSession
): Record<CognitiveFunction, number> {
  const avg = createEmptyScores();
  if (session.votes.length === 0) return avg;

  for (const vote of session.votes) {
    for (const fn of ALL_FUNCTIONS) {
      avg[fn] += vote.scores[fn] / session.votes.length;
    }
  }

  return avg;
}
