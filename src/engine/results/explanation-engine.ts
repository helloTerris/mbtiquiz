import type { StackMatch } from '@/types/stacks';
import type { NormalizedScores, ConfidenceMetrics } from '@/types/scoring';
import type { TypeExplanation } from '@/types/results';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import type { UserContext } from '@/types/context';
import { FUNCTION_LABELS } from '@/lib/constants';

function explainFunction(fn: CognitiveFunction, score: number, rank: number): string {
  const label = FUNCTION_LABELS[fn] || fn;

  if (rank <= 1) {
    return `${label} is one of your strongest thinking styles. You rely on it a lot — it's a big part of how you see the world and make choices.`;
  }
  if (rank <= 3) {
    return `${label} is something you use fairly often. It backs up your main strengths and comes out naturally in everyday situations.`;
  }
  if (rank <= 5) {
    return `${label} is somewhere in the middle for you. You can use it when you need to, but it's not where you go first.`;
  }
  return `${label} is one of your less-used styles. That's totally normal — everyone has areas they don't lean on as much.`;
}

export function generateExplanation(
  match: StackMatch,
  normalizedScores: NormalizedScores,
  confidence: ConfidenceMetrics,
  context?: UserContext | null
): TypeExplanation {
  const { stack } = match;

  const domLabel = FUNCTION_LABELS[stack.dominant];
  const auxLabel = FUNCTION_LABELS[stack.auxiliary];

  const summary = `Your answers point to ${match.type}. Your brain likes to lead with ${domLabel}, backed up by ${auxLabel}. Together, these two shape how you think, decide, and deal with the world around you.`;

  const functionExplanations: Partial<Record<CognitiveFunction, string>> = {};
  for (let i = 0; i < normalizedScores.rankings.length; i++) {
    const fn = normalizedScores.rankings[i];
    functionExplanations[fn] = explainFunction(
      fn,
      normalizedScores.globalNormalized[fn],
      i
    );
  }

  const stackExplanation = `Here's how your thinking styles stack up: ${stack.dominant} is your go-to, ${stack.auxiliary} is your helper, ${stack.tertiary} is something you're still developing, and ${stack.inferior} is your blind spot. This pattern matches ${match.type} with a ${Math.round(match.fitScore)}% fit.`;

  let caveat: string;
  if (confidence.overall >= 75) {
    caveat = `We're pretty confident about this one. Your answers were consistent and pointed clearly in the same direction.`;
  } else if (confidence.overall >= 50) {
    caveat = `We're fairly confident, but some of your answers were close calls. You can answer a few more questions to sharpen the result.`;
  } else {
    caveat = `Take this with a grain of salt — your answers were mixed, which could mean you're going through changes in life, your job or school is pushing you to act differently than you normally would, or you were answering based on who you want to be. Check out the other possible types below.`;
  }

  // Append context-aware notes
  if (context?.stressLevel === 'high') {
    caveat += ' Also, you mentioned being under a lot of stress right now — that can temporarily shift your patterns. Consider retaking when things calm down to see if results differ.';
  }
  if (context?.lifeStage === 'between-jobs') {
    caveat += ' Being between jobs is a high-pressure time that can make your decision-making look different from normal.';
  }
  if (context?.lifeStage === 'caregiver') {
    caveat += ' Caregiving heavily exercises Fe and Si regardless of type — your natural preferences outside of caregiving may differ.';
  }
  if (context?.lifeStage === 'retired' && confidence.overall >= 70) {
    caveat += ' Without strong work pressures shaping your behavior, these results may be an especially accurate picture of your natural style.';
  }

  return { summary, functionExplanations, stackExplanation, caveat };
}
