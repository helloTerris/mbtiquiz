import type { Answer } from '@/types/questions';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import type { MBTIType } from '@/types/stacks';
import { VALID_STACKS } from '@/engine/stacks/valid-stacks';
import { CORE_QUESTIONS } from '@/engine/questions/question-bank';
import { STRESS_QUESTIONS } from '@/engine/questions/stress-questions';

/**
 * Generate synthetic answers that would produce scores favoring the given type.
 * Fed into the real result generator so all explanations, stress profiles, etc.
 * are computed by the actual engine — not hardcoded.
 */
export function generatePresetAnswers(type: MBTIType): Answer[] {
  const stack = VALID_STACKS.find(s => s.type === type)!;

  // Weight how much we prefer each function (dom > aux > tert > inf)
  const preference: Partial<Record<CognitiveFunction, number>> = {
    [stack.dominant]: 4,
    [stack.auxiliary]: 3,
    [stack.tertiary]: 1.5,
    [stack.inferior]: 0.5,
  };

  const allQuestions = [...CORE_QUESTIONS, ...STRESS_QUESTIONS];

  return allQuestions.map(question => {
    const [optA, optB] = question.options;

    // Score each option by how well it aligns with the type's stack
    const scoreA = Object.entries(optA.functionWeights)
      .reduce((sum, [fn, w]) => sum + (preference[fn as CognitiveFunction] ?? 0) * (w as number), 0);
    const scoreB = Object.entries(optB.functionWeights)
      .reduce((sum, [fn, w]) => sum + (preference[fn as CognitiveFunction] ?? 0) * (w as number), 0);

    const selectedOption = scoreA >= scoreB ? optA : optB;

    // Stronger preference when the option clearly aligns, moderate otherwise
    const margin = Math.abs(scoreA - scoreB);
    const intensity: 1 | 2 | 3 = margin > 3 ? 3 : margin > 1 ? 2 : 1;

    return {
      questionId: question.id,
      selectedOptionId: selectedOption.id,
      timestamp: Date.now(),
      responseTimeMs: 4000 + Math.random() * 3000,
      intensity,
    };
  });
}
