import type { CognitiveFunction } from '@/types/cognitive-functions';
import { createEmptyScores } from '@/types/cognitive-functions';
import type { RawScores } from '@/types/scoring';
import type { Answer, Question } from '@/types/questions';
import type { UserContext } from '@/types/context';
import type { MBTIType } from '@/types/stacks';
import { VALID_STACKS } from '@/engine/stacks/valid-stacks';

export function createEmptyRawScores(): RawScores {
  return {
    scores: createEmptyScores(),
    questionCounts: createEmptyScores(),
  };
}

function getTimeModifier(responseTimeMs: number): number {
  if (responseTimeMs < 3000) return 1.1;  // fast = slight boost
  if (responseTimeMs > 10000) return 0.9; // slow = slight reduction
  return 1.0;
}

/**
 * Intensity multiplier: how strongly the user prefers their chosen option.
 * 1 = "barely" (0.5x) — near-neutral preference, counts half
 * 2 = "somewhat" (1.0x) — moderate preference, standard weight
 * 3 = "strongly" (1.5x) — clear preference, boosted weight
 *
 * This separates "which side" from "how much", so a 51/49 pick
 * no longer scores the same as a 90/10 conviction.
 */
function getIntensityMultiplier(intensity: 1 | 2 | 3): number {
  switch (intensity) {
    case 1: return 0.5;
    case 2: return 1.0;
    case 3: return 1.5;
  }
}

// Functions associated with structured environments
const STRUCTURED_FUNCTIONS: CognitiveFunction[] = ['Te', 'Si'];
// Functions associated with flexible environments
const FLEXIBLE_FUNCTIONS: CognitiveFunction[] = ['Ne', 'Se'];
// Functions reinforced by high social exposure
const HIGH_SOCIAL_FUNCTIONS: CognitiveFunction[] = ['Fe', 'Ne'];
// Functions reinforced by low social exposure (isolation)
const LOW_SOCIAL_FUNCTIONS: CognitiveFunction[] = ['Fi', 'Ti'];

/**
 * Environment discount: when a work-style answer aligns with the user's
 * reported daily structure, apply a small discount (0.9x) since the
 * environment may be driving the response rather than natural preference.
 */
function getWorkEnvironmentModifier(
  question: Question,
  selectedFunctions: CognitiveFunction[],
  context: UserContext | null
): number {
  if (!context || question.category !== 'work-style') return 1.0;

  const { dailyStructure } = context;
  if (dailyStructure === 'mixed') return 1.0;

  const alignsWithStructured = dailyStructure === 'structured'
    && selectedFunctions.some(fn => STRUCTURED_FUNCTIONS.includes(fn));
  const alignsWithFlexible = dailyStructure === 'flexible'
    && selectedFunctions.some(fn => FLEXIBLE_FUNCTIONS.includes(fn));

  if (alignsWithStructured || alignsWithFlexible) return 0.9;

  return 1.0;
}

/**
 * Social exposure discount: when a social-interaction answer aligns with
 * the user's reported social exposure level, apply a small discount (0.9x)
 * since the social environment may be shaping the response.
 *
 * High social exposure + Fe/Ne → discount (social life trained these)
 * Low social exposure + Fi/Ti → discount (isolation reinforced these)
 * Medium → no discount
 */
function getSocialEnvironmentModifier(
  question: Question,
  selectedFunctions: CognitiveFunction[],
  context: UserContext | null
): number {
  if (!context || question.category !== 'social-interaction') return 1.0;

  const { socialExposure } = context;
  if (socialExposure === 'medium') return 1.0;

  const alignsWithHigh = socialExposure === 'high'
    && selectedFunctions.some(fn => HIGH_SOCIAL_FUNCTIONS.includes(fn));
  const alignsWithLow = socialExposure === 'low'
    && selectedFunctions.some(fn => LOW_SOCIAL_FUNCTIONS.includes(fn));

  if (alignsWithHigh || alignsWithLow) return 0.9;

  return 1.0;
}

// Functions trained by "be tough" upbringing
const BE_TOUGH_FUNCTIONS: CognitiveFunction[] = ['Te', 'Ti'];
// Functions trained by "be kind" upbringing
const BE_KIND_FUNCTIONS: CognitiveFunction[] = ['Fe', 'Fi'];

/**
 * Upbringing discount: when answers on feeling/thinking axis questions align
 * with the user's upbringing style, apply a small discount (0.9x).
 *
 * "Be tough" upbringing + Te/Ti answers → discount (trained to think this way)
 * "Be kind" upbringing + Fe/Fi answers → discount (trained to feel this way)
 * "Balanced" → no discount
 *
 * Only applies to decision-making and social-interaction categories where
 * thinking vs feeling patterns are most influenced by upbringing.
 */
function getUpbringingModifier(
  question: Question,
  selectedFunctions: CognitiveFunction[],
  context: UserContext | null
): number {
  if (!context || !context.upbringing || context.upbringing === 'balanced') return 1.0;

  // Only discount on categories where upbringing most influences answers
  if (question.category !== 'decision-making' && question.category !== 'social-interaction') return 1.0;

  const alignsWithTough = context.upbringing === 'be-tough'
    && selectedFunctions.some(fn => BE_TOUGH_FUNCTIONS.includes(fn));
  const alignsWithKind = context.upbringing === 'be-kind'
    && selectedFunctions.some(fn => BE_KIND_FUNCTIONS.includes(fn));

  if (alignsWithTough || alignsWithKind) return 0.9;

  return 1.0;
}

/**
 * Confirmation bias discount: when a user has prior MBTI experience and a
 * self-reported type, answers that boost the dominant or auxiliary functions
 * of that type get a small discount (0.95x). People tend to answer as who
 * they think they are rather than who they naturally are.
 *
 * Only applies when previousMBTIExperience is true AND selfReportedType is set.
 */
function getConfirmationBiasModifier(
  selectedFunctions: CognitiveFunction[],
  context: UserContext | null
): number {
  if (!context || !context.previousMBTIExperience || !context.selfReportedType) return 1.0;

  const typeUpper = context.selfReportedType.toUpperCase() as MBTIType;
  const stack = VALID_STACKS.find(s => s.type === typeUpper);
  if (!stack) return 1.0;

  // Dominant and auxiliary are the functions most likely to be self-reinforced
  const selfReportedTopFunctions: CognitiveFunction[] = [stack.dominant, stack.auxiliary];

  const alignsWithSelfImage = selectedFunctions.some(fn =>
    selfReportedTopFunctions.includes(fn)
  );

  if (alignsWithSelfImage) return 0.95;

  return 1.0;
}

/**
 * Pure reducer: takes current scores + a new answer, returns updated scores.
 */
export function accumulateScore(
  current: RawScores,
  answer: Answer,
  question: Question,
  context?: UserContext | null
): RawScores {
  const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
  if (!selectedOption) return current;

  const timeModifier = getTimeModifier(answer.responseTimeMs);
  const intensityMultiplier = getIntensityMultiplier(answer.intensity ?? 2);
  const selectedFunctions = Object.keys(selectedOption.functionWeights) as CognitiveFunction[];
  const ctx = context ?? null;
  const workEnvModifier = getWorkEnvironmentModifier(question, selectedFunctions, ctx);
  const socialEnvModifier = getSocialEnvironmentModifier(question, selectedFunctions, ctx);
  const upbringingModifier = getUpbringingModifier(question, selectedFunctions, ctx);
  const confirmBiasModifier = getConfirmationBiasModifier(selectedFunctions, ctx);

  // Cap combined context modifiers at 0.85 (15% max discount) to prevent
  // over-penalizing people whose environment genuinely matches their type.
  const contextModifier = Math.max(0.85, workEnvModifier * socialEnvModifier * upbringingModifier * confirmBiasModifier);

  const newScores = { ...current.scores };
  const newCounts = { ...current.questionCounts };

  for (const [fn, weight] of Object.entries(selectedOption.functionWeights)) {
    const func = fn as CognitiveFunction;
    const effectiveWeight = (weight as number) * question.weight * timeModifier * intensityMultiplier * contextModifier;
    newScores[func] = (newScores[func] || 0) + effectiveWeight;
    newCounts[func] = (newCounts[func] || 0) + 1;
  }

  return { scores: newScores, questionCounts: newCounts };
}

/**
 * Batch accumulate all answers at once.
 */
export function accumulateAllScores(
  answers: Answer[],
  questions: Question[],
  context?: UserContext | null
): RawScores {
  const questionMap = new Map(questions.map(q => [q.id, q]));
  let scores = createEmptyRawScores();

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (question) {
      scores = accumulateScore(scores, answer, question, context);
    }
  }

  return scores;
}
