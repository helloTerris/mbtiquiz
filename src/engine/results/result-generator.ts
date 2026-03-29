import type { Answer, Question } from '@/types/questions';
import type { UserContext } from '@/types/context';
import type { QuizResult, LoopState } from '@/types/results';
import { accumulateAllScores } from '@/engine/scoring/score-accumulator';
import { normalize } from '@/engine/scoring/normalizer';
import { matchToStacks } from '@/engine/stacks/stack-validator';
import { rankStacks } from '@/engine/stacks/stack-ranker';
import { calculateConfidence } from '@/engine/scoring/confidence-calculator';
import { detectContradictions } from '@/engine/scoring/contradiction-detector';
import { detectLoop } from '@/engine/scoring/loop-detector';
import { generateExplanation } from './explanation-engine';
import { profileStress } from './stress-profiler';
import { analyzeTrueSelf } from './true-self-analyzer';
import { detectBias } from '@/engine/scoring/bias-detector';

/**
 * Orchestrates all scoring, validation, and explanation into a final QuizResult.
 */
export function generateResult(
  answers: Answer[],
  questions: Question[],
  context: UserContext | null
): QuizResult {
  // 1. Accumulate raw scores (with environment discount from context)
  const rawScores = accumulateAllScores(answers, questions, context);

  // 2. Normalize
  const normalizedScores = normalize(rawScores);

  // 3. Match to valid stacks
  const rawMatches = matchToStacks(normalizedScores);

  // 4. Rank and assign confidence
  const rankedMatches = rankStacks(rawMatches);

  // 5. Detect contradictions
  const contradictions = detectContradictions(answers, questions);

  // 6. Calculate overall confidence
  const confidence = calculateConfidence(
    answers,
    normalizedScores,
    rankedMatches,
    contradictions
  );

  // 7. Generate explanation
  const primaryMatch = rankedMatches[0];
  const explanations = generateExplanation(primaryMatch, normalizedScores, confidence);

  // 8. Stress profile
  const stressProfile = profileStress(primaryMatch.stack, normalizedScores);

  // 9. True self analysis
  const trueSelfAnalysis = analyzeTrueSelf(answers, questions);

  // 10. Bias detection
  const biasIndicators = detectBias(answers, questions, normalizedScores, context);

  // 11. Loop state detection
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

  // 12. Build function scores map
  const functionScores = normalizedScores.globalNormalized;

  return {
    primaryType: primaryMatch,
    alternativeTypes: rankedMatches.slice(1, 5),
    functionScores,
    confidence,
    contradictions,
    biasIndicators,
    explanations,
    stressProfile,
    trueSelfAnalysis,
    loopState,
    completedAt: Date.now(),
  };
}
