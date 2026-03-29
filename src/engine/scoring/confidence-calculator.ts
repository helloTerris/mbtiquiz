import type { Answer } from '@/types/questions';
import type { NormalizedScores, ConfidenceMetrics, Contradiction } from '@/types/scoring';
import type { StackMatch } from '@/types/stacks';
import type { UserContext } from '@/types/context';
import { QUESTION_PAIRS } from '@/types/cognitive-functions';
import { CONFIDENCE_WEIGHTS } from '@/lib/constants';

function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

export function calculateConfidence(
  answers: Answer[],
  normalizedScores: NormalizedScores,
  matches: StackMatch[],
  contradictions: Contradiction[],
  context?: UserContext | null
): ConfidenceMetrics {
  // Factor 1: Margin of victory (40%)
  const marginOfVictory =
    matches.length >= 2 ? matches[0].fitScore - matches[1].fitScore : 100;
  const marginConfidence = Math.min(100, marginOfVictory * 5);

  // Factor 2: Consistency (30%)
  const consistencyPenalty = contradictions.length * 15;
  const consistency = Math.max(0, 100 - consistencyPenalty);

  // Factor 3: Response time variance (15%)
  const times = answers.map((a) => a.responseTimeMs);
  const timeVar = variance(times);
  const responseTimeVariance = timeVar;
  const timeConfidence = Math.max(0, 100 - timeVar / 1000);

  // Factor 4: Score polarization (15%)
  const pairDifferences = QUESTION_PAIRS.map(([a, b]) =>
    Math.abs(normalizedScores.pairNormalized[a] - normalizedScores.pairNormalized[b])
  );
  const avgDiff =
    pairDifferences.reduce((s, d) => s + d, 0) / pairDifferences.length;
  const polarization = Math.min(100, avgDiff * 2);

  // Weighted overall
  let overall =
    marginConfidence * CONFIDENCE_WEIGHTS.margin +
    consistency * CONFIDENCE_WEIGHTS.consistency +
    timeConfidence * CONFIDENCE_WEIGHTS.responseTime +
    polarization * CONFIDENCE_WEIGHTS.polarization;

  // Retired bonus: less environmental pressure = more trustworthy answers
  if (context?.lifeStage === 'retired') {
    overall = Math.min(100, overall + 5);
  }

  // High stress penalty: answers under stress are less reliable
  if (context?.stressLevel === 'high') {
    overall = Math.max(0, overall - 8);
  }

  // Detect ambiguous pairs
  const ambiguousPairs = QUESTION_PAIRS.filter(
    ([a, b]) =>
      Math.abs(normalizedScores.pairNormalized[a] - normalizedScores.pairNormalized[b]) < 12
  ) as [typeof QUESTION_PAIRS[number][0], typeof QUESTION_PAIRS[number][1]][];

  return {
    overall: Math.round(overall),
    marginOfVictory,
    consistency,
    contradictionCount: contradictions.length,
    responseTimeVariance,
    polarization,
    ambiguousPairs,
  };
}
