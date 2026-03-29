import Anthropic from '@anthropic-ai/sdk';
import type { PersonalizeRequest, PersonalizeResponse, PersonalizedQuestionOutput } from '@/types/ai-questions';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a question personalization engine for a cognitive function assessment.
Your job is to rewrite question and option text so it feels personally relevant to the test-taker based on their life context.

RULES:
1. Preserve the psychological meaning EXACTLY. Each option tests a specific cognitive pattern (shown in primaryAxis). Option A must still clearly represent the first function, Option B the second function.
2. Rewrite the question stem to use scenarios from the person's actual life.
3. Rewrite each option to use language and examples from their daily reality.
4. Keep option text roughly the same length as the original (under 40 words each).
5. Keep the tone warm, casual, and second-person ("you").
6. Never reference MBTI, cognitive functions, personality types, or psychology terminology.
7. Never make one option sound better or more desirable than the other.
8. Return ONLY valid JSON matching the schema below. No markdown, no explanation, no wrapping.

Output schema (JSON array):
[{ "id": "original-id", "text": "rewritten question", "options": [{ "id": "original-option-id", "text": "rewritten option A" }, { "id": "original-option-id", "text": "rewritten option B" }] }]`;

function buildUserPrompt(req: PersonalizeRequest): string {
  const { context, questions } = req;

  const contextLines = [
    `Life stage: ${context.lifeStage}${context.lifeStageDetail ? ` (${context.lifeStageDetail})` : ''}`,
    `Work/environment: ${context.workEnvironment}${context.workEnvironmentDetail ? ` (${context.workEnvironmentDetail})` : ''}`,
    `Daily structure: ${context.dailyStructure}`,
    `Social exposure: ${context.socialExposure}`,
    `Living situation: ${context.livingSituation}`,
    `Stress level: ${context.stressLevel}`,
  ];

  if (context.isTypingOther && context.otherPersonName) {
    contextLines.push(`Note: The user is answering on behalf of someone named ${context.otherPersonName}.`);
  }

  const strippedQuestions = questions.map((q) => ({
    id: q.id,
    primaryAxis: q.primaryAxis,
    category: q.category,
    text: q.text,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
  }));

  return `Person's context:\n${contextLines.map((l) => `- ${l}`).join('\n')}\n\nRewrite these ${questions.length} questions for this person:\n\n${JSON.stringify(strippedQuestions, null, 2)}`;
}

function validateResponse(
  parsed: unknown,
  expectedIds: { qId: string; optionIds: [string, string] }[]
): PersonalizedQuestionOutput[] | null {
  if (!Array.isArray(parsed)) return null;
  if (parsed.length !== expectedIds.length) return null;

  const results: PersonalizedQuestionOutput[] = [];

  for (let i = 0; i < expectedIds.length; i++) {
    const item = parsed[i];
    const expected = expectedIds[i];

    if (
      !item ||
      typeof item.id !== 'string' ||
      typeof item.text !== 'string' ||
      !Array.isArray(item.options) ||
      item.options.length !== 2
    ) {
      return null;
    }

    // Validate IDs match
    if (item.id !== expected.qId) return null;
    if (
      typeof item.options[0]?.id !== 'string' ||
      typeof item.options[0]?.text !== 'string' ||
      typeof item.options[1]?.id !== 'string' ||
      typeof item.options[1]?.text !== 'string'
    ) {
      return null;
    }
    if (
      item.options[0].id !== expected.optionIds[0] ||
      item.options[1].id !== expected.optionIds[1]
    ) {
      return null;
    }

    results.push({
      id: item.id,
      text: item.text,
      options: [
        { id: item.options[0].id, text: item.options[0].text },
        { id: item.options[1].id, text: item.options[1].text },
      ],
    });
  }

  return results;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as PersonalizeRequest;

    // Basic validation
    if (
      !body.chunk ||
      !Array.isArray(body.questions) ||
      body.questions.length === 0 ||
      !body.context
    ) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Sanitize detail fields
    if (body.context.lifeStageDetail) {
      body.context.lifeStageDetail = body.context.lifeStageDetail.slice(0, 60).replace(/[^\w\s\-.,/()&]/g, '');
    }
    if (body.context.workEnvironmentDetail) {
      body.context.workEnvironmentDetail = body.context.workEnvironmentDetail.slice(0, 60).replace(/[^\w\s\-.,/()&]/g, '');
    }

    const userPrompt = buildUserPrompt(body);

    const expectedIds = body.questions.map((q) => ({
      qId: q.id,
      optionIds: [q.options[0].id, q.options[1].id] as [string, string],
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extract text from response
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json({ error: 'No text response from AI' }, { status: 502 });
    }

    // Parse JSON response
    let parsed: unknown;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return Response.json({ error: 'AI returned invalid JSON' }, { status: 502 });
    }

    // Validate structure and IDs
    const validated = validateResponse(parsed, expectedIds);
    if (!validated) {
      return Response.json({ error: 'AI response failed validation' }, { status: 502 });
    }

    const result: PersonalizeResponse = { questions: validated };
    return Response.json(result);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: 'Rate limited' }, { status: 429 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: 'API key invalid' }, { status: 401 });
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `AI service error: ${error.message}` }, { status: 502 });
    }
    console.error('Personalize questions error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
