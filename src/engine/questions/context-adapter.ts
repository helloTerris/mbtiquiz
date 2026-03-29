import type { Question } from '@/types/questions';
import type { UserContext } from '@/types/context';

/**
 * Adapt question wording based on user's context (life stage, work environment, etc.).
 * Uses priority-based matching:
 * 1. Match both lifeStage AND workEnvironment (most specific)
 * 2. Match lifeStage only
 * 3. Match workEnvironment only
 * 4. Fall back to default question text
 */
export function adaptQuestion(question: Question, context: UserContext): Question {
  if (!question.contextVariants || question.contextVariants.length === 0) {
    return question;
  }

  // Priority 1: both lifeStage and workEnvironment match
  const bothMatch = question.contextVariants.find(
    v => v.lifeStage === context.lifeStage && v.workEnvironment === context.workEnvironment
  );
  if (bothMatch) {
    return { ...question, text: bothMatch.questionText, options: bothMatch.options };
  }

  // Priority 2: lifeStage match only
  const lifeStageMatch = question.contextVariants.find(
    v => v.lifeStage === context.lifeStage && !v.workEnvironment
  );
  if (lifeStageMatch) {
    return { ...question, text: lifeStageMatch.questionText, options: lifeStageMatch.options };
  }

  // Priority 3: workEnvironment match only
  const workEnvMatch = question.contextVariants.find(
    v => v.workEnvironment === context.workEnvironment && !v.lifeStage
  );
  if (workEnvMatch) {
    return { ...question, text: workEnvMatch.questionText, options: workEnvMatch.options };
  }

  return question;
}

/**
 * Adapt all questions in a batch.
 */
export function adaptQuestions(questions: Question[], context: UserContext): Question[] {
  return questions.map(q => adaptQuestion(q, context));
}
