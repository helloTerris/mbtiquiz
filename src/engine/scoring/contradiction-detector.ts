import type { Answer, Question } from '@/types/questions';
import type { Contradiction } from '@/types/scoring';
import type { CognitiveFunction } from '@/types/cognitive-functions';

/**
 * Detect contradictions between redundancy-paired questions.
 * If a user answers Ti on one question and Te on its redundancy pair,
 * that is a contradiction.
 */

function getDominantFunction(question: Question, answer: Answer): CognitiveFunction | null {
  const option = question.options.find((o) => o.id === answer.selectedOptionId);
  if (!option) return null;

  let maxWeight = -Infinity;
  let maxFn: CognitiveFunction | null = null;

  for (const [fn, weight] of Object.entries(option.functionWeights)) {
    if ((weight as number) > maxWeight) {
      maxWeight = weight as number;
      maxFn = fn as CognitiveFunction;
    }
  }

  return maxFn;
}

export function detectContradictions(
  answers: Answer[],
  questions: Question[]
): Contradiction[] {
  const contradictions: Contradiction[] = [];
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  for (const question of questions) {
    if (!question.redundancyOf) continue;

    const answer1 = answerMap.get(question.id);
    const answer2 = answerMap.get(question.redundancyOf);
    const question2 = questionMap.get(question.redundancyOf);

    if (!answer1 || !answer2 || !question2) continue;

    const fn1 = getDominantFunction(question, answer1);
    const fn2 = getDominantFunction(question2, answer2);

    if (fn1 && fn2 && fn1 !== fn2) {
      contradictions.push({
        questionId1: question.id,
        questionId2: question.redundancyOf,
        description: `Answered toward ${fn1} on one question but ${fn2} on a similar question`,
        severity: 'medium',
        affectedFunctions: [fn1, fn2],
      });
    }
  }

  return contradictions;
}
