import type { Question } from '@/types/questions';
import type { UserContext } from '@/types/context';
import type {
  QuestionForAI,
  AIContext,
  PersonalizeRequest,
  PersonalizedQuestionOutput,
  PersonalizeResponse,
} from '@/types/ai-questions';
import { getQuestionsByChunk } from '@/engine/questions/question-bank';

/** Project UserContext → AIContext (strips scoring-only fields) */
export function buildAIContext(ctx: UserContext): AIContext {
  return {
    lifeStage: ctx.lifeStage,
    lifeStageDetail: ctx.lifeStageDetail,
    workEnvironment: ctx.workEnvironment,
    workEnvironmentDetail: ctx.workEnvironmentDetail,
    dailyStructure: ctx.dailyStructure,
    socialExposure: ctx.socialExposure,
    livingSituation: ctx.livingSituation,
    stressLevel: ctx.stressLevel,
    isTypingOther: ctx.isTypingOther,
    otherPersonName: ctx.otherPersonName,
  };
}

/** Strip functionWeights from questions for the AI payload */
export function stripQuestionsForAI(questions: Question[]): QuestionForAI[] {
  return questions.map((q) => ({
    id: q.id,
    primaryAxis: q.primaryAxis,
    category: q.category,
    text: q.text,
    options: [
      { id: q.options[0].id, text: q.options[0].text },
      { id: q.options[1].id, text: q.options[1].text },
    ],
  }));
}

/** Merge AI-personalized text onto base questions, preserving all scoring fields */
export function mergePersonalized(
  baseQuestions: Question[],
  personalized: PersonalizedQuestionOutput[]
): Question[] {
  const aiMap = new Map(personalized.map((p) => [p.id, p]));

  return baseQuestions.map((q) => {
    const ai = aiMap.get(q.id);
    if (!ai) return q;

    return {
      ...q,
      text: ai.text,
      options: [
        { ...q.options[0], text: ai.options[0].text },
        { ...q.options[1], text: ai.options[1].text },
      ],
    };
  });
}

/** Fetch a fresh AI rewrite for a single question */
export async function fetchRefreshedQuestion(
  questionId: string,
  chunk: number,
  context: UserContext,
  signal?: AbortSignal
): Promise<PersonalizedQuestionOutput> {
  const baseQuestions = getQuestionsByChunk(chunk);
  const baseQuestion = baseQuestions.find((q) => q.id === questionId);
  if (!baseQuestion) throw new Error(`Question ${questionId} not found in chunk ${chunk}`);

  const payload: PersonalizeRequest = {
    chunk,
    questions: stripQuestionsForAI([baseQuestion]),
    context: buildAIContext(context),
  };

  const res = await fetch('/api/personalize-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'no body');
    throw new Error(`Refresh failed: ${res.status} — ${errorBody}`);
  }

  const data = (await res.json()) as PersonalizeResponse;
  return data.questions[0];
}

/** Fetch personalized questions for a chunk from the API route */
export async function fetchPersonalizedChunk(
  chunk: number,
  context: UserContext,
  signal?: AbortSignal
): Promise<PersonalizedQuestionOutput[]> {
  const questions = getQuestionsByChunk(chunk);
  const payload: PersonalizeRequest = {
    chunk,
    questions: stripQuestionsForAI(questions),
    context: buildAIContext(context),
  };

  console.log(`[AI Questions] Fetching chunk ${chunk} from API (${questions.length} questions)...`);

  const res = await fetch('/api/personalize-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'no body');
    console.error(`[AI Questions] API returned ${res.status}: ${errorBody}`);
    throw new Error(`Personalization failed: ${res.status} — ${errorBody}`);
  }

  const data = (await res.json()) as PersonalizeResponse;
  console.log(`[AI Questions] Chunk ${chunk}: received ${data.questions?.length} personalized questions`);
  return data.questions;
}
