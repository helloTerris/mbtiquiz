import type { Answer, Question } from '@/types/questions';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { ALL_FUNCTIONS, createEmptyScores } from '@/types/cognitive-functions';
import type { TrueSelfAnalysis, DivergencePoint } from '@/types/results';
import { FUNCTION_LABELS } from '@/lib/constants';

/**
 * Separates "default behavior" question answers from regular answers
 * to compare natural cognition vs environment-adapted cognition.
 *
 * "Default vs forced" questions explicitly strip environmental pressure
 * ("When free from obligations, you..."), revealing natural preference.
 * Regular questions may reflect adapted behavior shaped by job/school/social context.
 */

function scoreSubset(
  answers: Answer[],
  questions: Question[],
  filterFn: (q: Question) => boolean
): Record<CognitiveFunction, number> {
  const scores = createEmptyScores();
  const counts = createEmptyScores();
  const questionMap = new Map(questions.map(q => [q.id, q]));

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question || !filterFn(question)) continue;

    const option = question.options.find(o => o.id === answer.selectedOptionId);
    if (!option) continue;

    for (const [fn, weight] of Object.entries(option.functionWeights)) {
      const func = fn as CognitiveFunction;
      scores[func] += weight as number;
      counts[func] += 1;
    }
  }

  // Normalize to 0-100
  const maxScore = Math.max(...ALL_FUNCTIONS.map(fn => scores[fn]), 1);
  const normalized = createEmptyScores();
  for (const fn of ALL_FUNCTIONS) {
    normalized[fn] = (scores[fn] / maxScore) * 100;
  }

  return normalized;
}

const DIVERGENCE_THRESHOLD = 15; // Minimum gap to flag as divergence

function interpretDivergence(
  fn: CognitiveFunction,
  natural: number,
  adapted: number
): string {
  const label = FUNCTION_LABELS[fn] || fn;
  const gap = adapted - natural;

  if (gap > 0) {
    return `Your environment may be pushing you toward more ${label} (${fn}) than is natural for you. This could come from workplace demands, social expectations, or role requirements.`;
  }
  return `You may naturally rely on ${label} (${fn}) more than your environment allows you to express. This function might feel suppressed by current circumstances.`;
}

export function analyzeTrueSelf(
  answers: Answer[],
  questions: Question[]
): TrueSelfAnalysis | null {
  // Need at least some "default vs forced" questions answered
  const defaultQuestions = questions.filter(q => q.isDefaultVsForced);
  const answeredDefaults = answers.filter(a =>
    defaultQuestions.some(q => q.id === a.questionId)
  );

  if (answeredDefaults.length < 2) return null;

  // Score "natural self" from default-vs-forced questions only
  const naturalScores = scoreSubset(answers, questions, q => q.isDefaultVsForced === true);

  // Score "adapted self" from non-default questions only
  const adaptedScores = scoreSubset(answers, questions, q => !q.isDefaultVsForced);

  // Find divergences
  const divergencePoints: DivergencePoint[] = [];
  for (const fn of ALL_FUNCTIONS) {
    const gap = Math.abs(naturalScores[fn] - adaptedScores[fn]);
    if (gap >= DIVERGENCE_THRESHOLD) {
      divergencePoints.push({
        function: fn,
        naturalScore: naturalScores[fn],
        adaptedScore: adaptedScores[fn],
        possibleCause: interpretDivergence(fn, naturalScores[fn], adaptedScores[fn]),
      });
    }
  }

  // Sort by largest divergence
  divergencePoints.sort(
    (a, b) =>
      Math.abs(b.naturalScore - b.adaptedScore) -
      Math.abs(a.naturalScore - a.adaptedScore)
  );

  return {
    naturalScores,
    adaptedScores,
    divergencePoints,
  };
}
