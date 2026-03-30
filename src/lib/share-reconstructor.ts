import type { CognitiveFunction } from '@/types/cognitive-functions';
import type { MBTIType } from '@/types/stacks';
import type { NormalizedScores } from '@/types/scoring';
import type { QuizResult, LoopState } from '@/types/results';
import { ALL_FUNCTIONS, QUESTION_PAIRS } from '@/types/cognitive-functions';
import { matchToStacks } from '@/engine/stacks/stack-validator';
import { rankStacks } from '@/engine/stacks/stack-ranker';
import { generateExplanation } from '@/engine/results/explanation-engine';
import { profileStress } from '@/engine/results/stress-profiler';
import { detectLoop } from '@/engine/scoring/loop-detector';

/**
 * Reconstruct a NormalizedScores object from global scores alone.
 * We treat the global scores as-is and derive pair normalization from them.
 */
function rebuildNormalizedScores(
  globalScores: Record<CognitiveFunction, number>
): NormalizedScores {
  // Pair normalization: within each pair, rescale to 0-100
  const pairNormalized = {} as Record<CognitiveFunction, number>;
  for (const [funcA, funcB] of QUESTION_PAIRS) {
    const total = globalScores[funcA] + globalScores[funcB];
    if (total === 0) {
      pairNormalized[funcA] = 50;
      pairNormalized[funcB] = 50;
    } else {
      pairNormalized[funcA] = (globalScores[funcA] / total) * 100;
      pairNormalized[funcB] = (globalScores[funcB] / total) * 100;
    }
  }

  // Rankings: sort by score descending
  const rankings = [...ALL_FUNCTIONS].sort(
    (a, b) => globalScores[b] - globalScores[a]
  );

  return {
    pairNormalized,
    globalNormalized: { ...globalScores },
    rankings,
  };
}

/**
 * Reconstruct a full QuizResult from decoded shared data.
 * Sections requiring original answers (contradictions, bias, true-self) are empty.
 */
export function reconstructSharedResult(
  scores: Record<CognitiveFunction, number>,
  type: MBTIType,
  confidence: number
): QuizResult {
  const normalizedScores = rebuildNormalizedScores(scores);

  // Run stack matching from the scores
  const rawMatches = matchToStacks(normalizedScores);
  const rankedMatches = rankStacks(rawMatches);

  // Use the encoded type as primary (it was the original result)
  const primaryMatch = rankedMatches.find(m => m.type === type) || rankedMatches[0];
  const alternatives = rankedMatches.filter(m => m.type !== primaryMatch.type).slice(0, 4);

  // Generate explanations (no context — shared view skips context-aware caveats)
  const confidenceMetrics = {
    overall: confidence,
    marginOfVictory: rankedMatches.length >= 2
      ? rankedMatches[0].fitScore - rankedMatches[1].fitScore
      : 100,
    consistency: 85, // reasonable default for shared
    contradictionCount: 0,
    responseTimeVariance: 0,
    polarization: 60,
    ambiguousPairs: [] as [CognitiveFunction, CognitiveFunction][],
  };

  const explanations = generateExplanation(primaryMatch, normalizedScores, confidenceMetrics);
  const stressProfile = profileStress(primaryMatch.stack, normalizedScores);

  const loopIndicator = detectLoop(normalizedScores);
  const loopState: LoopState = loopIndicator
    ? {
        detected: true,
        loopFunctions: loopIndicator.loopFunctions,
        suppressedFunction: loopIndicator.suppressedFunction,
        severity: loopIndicator.severity,
        description: loopIndicator.description,
      }
    : {
        detected: false,
        loopFunctions: null,
        suppressedFunction: null,
        severity: null,
        description: null,
      };

  return {
    primaryType: primaryMatch,
    alternativeTypes: alternatives,
    functionScores: scores,
    confidence: confidenceMetrics,
    contradictions: [],
    biasIndicators: [],
    explanations,
    stressProfile,
    trueSelfAnalysis: null,
    loopState,
    completedAt: Date.now(),
    isShared: true,
  };
}
