import type { Question, ChoiceOption } from '@/types/questions';
import type { UserContext } from '@/types/context';
import type {
  QuestionForAI,
  AIContext,
  PersonalizeRequest,
  PersonalizedQuestionOutput,
  PersonalizeResponse,
  PreviousVersion,
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
    hobbies: ctx.hobbies,
    stressLevel: ctx.stressLevel,
    mentalEnergy: ctx.mentalEnergy,
    culturalValues: ctx.culturalValues,
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

/** Build extra ChoiceOptions from an AI response, copying functionWeights from the base question */
export function buildExtraOptions(
  baseQuestion: Question,
  aiResponse: PersonalizedQuestionOutput,
  generationIndex: number
): ChoiceOption[] {
  return [
    {
      id: `${baseQuestion.options[0].id}-gen${generationIndex}`,
      text: aiResponse.options[0].text,
      functionWeights: { ...baseQuestion.options[0].functionWeights },
    },
    {
      id: `${baseQuestion.options[1].id}-gen${generationIndex}`,
      text: aiResponse.options[1].text,
      functionWeights: { ...baseQuestion.options[1].functionWeights },
    },
  ];
}

/** Fetch a fresh AI rewrite for a single question */
export async function fetchRefreshedQuestion(
  questionId: string,
  chunk: number,
  context: UserContext,
  previousVersions: PreviousVersion[],
  signal?: AbortSignal
): Promise<PersonalizedQuestionOutput> {
  const baseQuestions = getQuestionsByChunk(chunk);
  const baseQuestion = baseQuestions.find((q) => q.id === questionId);
  if (!baseQuestion) throw new Error(`Question ${questionId} not found in chunk ${chunk}`);

  const stripped = stripQuestionsForAI([baseQuestion]);
  if (previousVersions.length > 0) {
    stripped[0].previousVersions = previousVersions;
  }

  const payload: PersonalizeRequest = {
    chunk,
    questions: stripped,
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

/** Fetch personalized text for arbitrary questions (e.g. adaptive/refine questions) */
export async function fetchPersonalizedQuestions(
  questions: Question[],
  context: UserContext,
  signal?: AbortSignal
): Promise<PersonalizedQuestionOutput[]> {
  const payload: PersonalizeRequest = {
    chunk: 0,
    questions: stripQuestionsForAI(questions),
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
    throw new Error(`Personalization failed: ${res.status} — ${errorBody}`);
  }

  const data = (await res.json()) as PersonalizeResponse;
  return data.questions;
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
