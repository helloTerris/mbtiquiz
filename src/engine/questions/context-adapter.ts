import type { Question } from '@/types/questions';
import type { UserContext } from '@/types/context';

/**
 * Adapt question wording based on user's context (life stage, etc.).
 * Returns the same question with context-appropriate text if a variant exists.
 */
export function adaptQuestion(question: Question, context: UserContext): Question {
  if (!question.contextVariants || question.contextVariants.length === 0) {
    return question;
  }

  const variant = question.contextVariants.find(
    v => v.lifeStage === context.lifeStage
  );

  if (!variant) return question;

  return {
    ...question,
    text: variant.questionText,
    options: variant.options,
  };
}

/**
 * Adapt all questions in a batch.
 */
export function adaptQuestions(questions: Question[], context: UserContext): Question[] {
  return questions.map(q => adaptQuestion(q, context));
}
