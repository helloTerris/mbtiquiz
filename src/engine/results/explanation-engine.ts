import type { StackMatch } from '@/types/stacks';
import type { NormalizedScores, ConfidenceMetrics } from '@/types/scoring';
import type { TypeExplanation } from '@/types/results';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { FUNCTION_LABELS } from '@/lib/constants';

function explainFunction(fn: CognitiveFunction, score: number, rank: number): string {
  const label = FUNCTION_LABELS[fn] || fn;
  const strength =
    score >= 70 ? 'strongly' : score >= 55 ? 'moderately' : 'slightly';

  if (rank <= 1) {
    return `${label} (${fn}) appears to be one of your dominant functions. You ${strength} prefer this mode of processing, suggesting it plays a central role in how you engage with the world.`;
  }
  if (rank <= 3) {
    return `${label} (${fn}) shows moderate presence in your profile. This function likely supports your primary modes and surfaces in familiar contexts.`;
  }
  if (rank <= 5) {
    return `${label} (${fn}) scored in the middle range. This may be a developing function or one you access situationally.`;
  }
  return `${label} (${fn}) scored lower in your profile. This is consistent with it being a less-preferred mode — potentially your tertiary or inferior function.`;
}

export function generateExplanation(
  match: StackMatch,
  normalizedScores: NormalizedScores,
  confidence: ConfidenceMetrics
): TypeExplanation {
  const { stack } = match;

  const domLabel = FUNCTION_LABELS[stack.dominant];
  const auxLabel = FUNCTION_LABELS[stack.auxiliary];

  const summary = `Based on your responses, you most closely align with ${match.type}. Your dominant function appears to be ${domLabel} (${stack.dominant}), supported by ${auxLabel} (${stack.auxiliary}). This combination shapes how you process information and make decisions.`;

  const functionExplanations: Partial<Record<CognitiveFunction, string>> = {};
  for (let i = 0; i < normalizedScores.rankings.length; i++) {
    const fn = normalizedScores.rankings[i];
    functionExplanations[fn] = explainFunction(
      fn,
      normalizedScores.globalNormalized[fn],
      i
    );
  }

  const stackExplanation = `The ${match.type} function stack (${stack.dominant} → ${stack.auxiliary} → ${stack.tertiary} → ${stack.inferior}) fits your profile with a ${Math.round(match.fitScore)}% match score. Your responses show a clear preference for ${stack.dominant} over its counterpart, with ${stack.auxiliary} as a natural complement.`;

  let caveat: string;
  if (confidence.overall >= 75) {
    caveat = `Your results show strong consistency (${confidence.overall}% confidence). The pattern is clear across multiple question categories.`;
  } else if (confidence.overall >= 50) {
    caveat = `Your results show moderate confidence (${confidence.overall}%). Some function preferences were close — consider retaking the refinement questions to sharpen the result.`;
  } else {
    caveat = `Your results show lower confidence (${confidence.overall}%). This could mean you are in a transitional period, your environment strongly shapes your behavior, or some answers reflected aspiration rather than natural preference. Consider the alternative types below.`;
  }

  return { summary, functionExplanations, stackExplanation, caveat };
}
