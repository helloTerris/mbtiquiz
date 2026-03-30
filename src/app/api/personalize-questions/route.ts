import Anthropic from '@anthropic-ai/sdk';
import type { PersonalizeRequest, PersonalizeResponse, PersonalizedQuestionOutput } from '@/types/ai-questions';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `You are a question personalization engine for a cognitive function assessment.
Rewrite question and option text so it feels personally relevant to the test-taker.

FUNCTION REFERENCE (what each axis measures):
- Ti/Te: Internal logical analysis vs external systematic execution
- Fi/Fe: Personal values/authenticity vs group harmony/emotional awareness
- Ni/Ne: Focused singular insight vs divergent idea exploration
- Si/Se: Past experience/routine vs present-moment sensory engagement

Option A always maps to the FIRST function in primaryAxis, Option B to the SECOND. Preserve this exactly.

CATEGORY tells you the life domain AND which context to draw from:

USE WORK/SCHOOL CONTEXT for these categories — frame around their job, classes, professional life:
- work-style → how they work, organize, produce
- decision-making → choices and tradeoffs in their professional/practical life

USE PERSONAL/OFF-DUTY CONTEXT for these categories — frame around hobbies, downtime, personal relationships, weekends, free time. NEVER frame these around work or obligations:
- inner-world → private thoughts, feelings, what they do alone at home
- default-vs-forced → what they naturally do with zero obligation (this is the MOST IMPORTANT category for accuracy — work habits are often forced, not natural)
- social-interaction → friends, family, social gatherings, dating — NOT coworkers or clients

USE EITHER (but vary it) for these:
- information-processing → learning, thinking, absorbing info (can be work or personal curiosity)
- stress-response → pressure, overwhelm (can be work deadlines OR personal life stress)

WHY THIS MATTERS: People often behave differently at work vs their natural state. A person forced to be organized at work might be chaotic at home — the home behavior reveals their real type. If you frame EVERY question around work, you're testing their work persona, not their actual cognitive wiring.

CORE PRINCIPLE — GROUND IN THE RIGHT CONTEXT:
Use the person's context to pick scenarios, but match the scenario to the CATEGORY above. For work-style, use their job. For inner-world and default-vs-forced, use their hobbies, home life, weekends, personal interests. Make the scenario vivid and specific either way.

Examples of grounding by category:
- work-style, web designer: "A client wants their site redesigned from scratch. You:"
- inner-world, web designer: "It's Sunday morning, you've got nowhere to be. Your mind:"
- default-vs-forced, web designer: "You're scrolling your phone in bed with nothing planned. You:"
- social-interaction, web designer: "Your friend group is planning a weekend trip. You:"
- decision-making, student: "You're picking your electives for next semester. You:"
- stress-response, freelancer: "Three deadlines hit at once and your laptop crashes. You:"

NEVER leave generic phrases like "a project," "a creative task," "your work," "a problem." Replace them with SPECIFIC things from the right context for that category.

SINGLE SUBJECT RULE:
Each question must use ONE consistent subject/person throughout — the question stem AND both options. If the base question mentions multiple subjects (e.g. "a client or classmate"), pick the ONE that fits the person's context best. Do NOT mix subjects across options or hedge with "or." The whole question should feel like one coherent scenario about one specific person or situation in their life.

RULES:
1. Rewrite the question stem as a specific scenario from the person's actual daily life. End the stem so the options naturally complete it (e.g. "You tend to:" or "What happens is:"). Replace every generic word with something from their context.
2. Each option MUST directly answer the question. If the question asks "you start to:", the option says what you start to do. The option is a DIRECT CONTINUATION of the question stem — not a tangent, not a separate thought.
3. Each option describes ONE concrete action with a quick "like..." example. Structure: [what you do] — like [one vivid example from their life]. Keep the action and the example tightly connected. Do NOT ramble or chain multiple scenarios.
4. The two options must be CLEARLY DIFFERENT approaches — not two ways of saying the same thing. A stranger should be able to read them and immediately see two distinct behaviors.
5. Both options must feel equally valid and appealing — no "right answer."
6. Both options must be roughly the same length (within ~10 words of each other).
7. Don't make one option sound more "mature," "wise," "deep," or "self-aware" than the other. Neither should sound like the "smarter" choice.
8. Avoid value-loaded words in only one option (e.g., don't use "thoughtful" in one and "impulsive" in the other). If one option uses a positive-sounding word, the other must too.
9. Both options should sound like something a normal, healthy person would do — neither should sound dysfunctional or immature.
10. Keep question text under 20 words, option text under 50 words each.
11. Write like you're talking to a friend over coffee. Dead-simple everyday language — short sentences, common words, zero jargon. A 12-year-old should understand it.
12. Be vivid and specific. Use "you grab your phone and google it" not "you seek external resources." Real actions, real objects, real moments from THEIR life, not generic ones.
13. Return ONLY a raw JSON array. No markdown, no explanation.

EXAMPLE:
Context: freelance web designer, flexible schedule, lives alone
Base: {"id":"q1","primaryAxis":["Ti","Te"],"category":"decision-making","text":"When you're trying to figure out a tough problem:","options":[{"id":"q1-a","text":"You work it out yourself from scratch — you need to fully understand the \"why\" before you do anything."},{"id":"q1-b","text":"You find a method that already works and use it — getting results matters more than understanding every detail."}]}
Rewritten: {"id":"q1","text":"A client's website is broken and you have no idea why:","options":[{"id":"q1-a","text":"You open DevTools and trace it yourself — like reading the code line by line until you actually understand what broke and why."},{"id":"q1-b","text":"You google the error, find a fix that works, and ship it — like grabbing the first Stack Overflow answer and moving on."}]}
WHY IT WORKS: "tough problem" became "client's website is broken." "work it out yourself" became "open DevTools and trace it." Every word maps to what a freelance web designer actually does.

BAD (abstract, not grounded in their life):
Context: freelance web designer
Q: "Stress piles up at work. You start to:"
A: "Convince yourself everything is about to collapse — like picturing yourself going broke and losing it all."
B: "Get stuck replaying every past mistake — like that one project you botched keeps looping in your head."
WHY IT'S BAD: "work" is vague — say "client deadlines." Neither option says what you START TO DO. They describe abstract mental spirals, not actions a web designer would take.

GOOD (grounded in their actual life, answers the question):
Context: freelance web designer
Q: "Three client deadlines land in the same week and you're falling behind. You start to:"
A: "Make a spreadsheet of what's due when and triage by urgency — like writing out 'if I miss this one, here's the fallback plan for each client.'"
B: "Go back to your usual crunch routine that's gotten you through before — like pulling the same late-night workflow you always do when things pile up."

REGENERATION:
If a question includes "previousVersions", the user already saw those and is asking for something DIFFERENT. You MUST:
- Use a completely different scenario/angle from ALL listed previous versions.
- Use different actions, different examples, different framing. Do NOT rephrase the same idea.
- Still measure the SAME cognitive function axis (primaryAxis) and stay within the SAME category.
- The new version should feel like a genuinely fresh question, not a remix.

OUTPUT SCHEMA: [{ "id": "...", "text": "...", "options": [{ "id": "...", "text": "..." }, { "id": "...", "text": "..." }] }]`;

function buildUserPrompt(req: PersonalizeRequest): string {
  const { context, questions } = req;

  const contextLines = [
    `Life stage: ${context.lifeStage}${context.lifeStageDetail ? ` (${context.lifeStageDetail})` : ''}`,
    `Work/environment: ${context.workEnvironment}${context.workEnvironmentDetail ? ` (${context.workEnvironmentDetail})` : ''}`,
    `Daily structure: ${context.dailyStructure}`,
    `Social exposure: ${context.socialExposure}`,
    `Living situation: ${context.livingSituation}`,
    ...(context.hobbies ? [`Hobbies/interests: ${context.hobbies}`] : []),
    `Stress level: ${context.stressLevel}`,
    `Mental energy: ${context.mentalEnergy}`,
    `Cultural values: ${context.culturalValues}`,
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
    ...(q.previousVersions?.length ? { previousVersions: q.previousVersions } : {}),
  }));

  return `Person's context:\n${contextLines.map((l) => `- ${l}`).join('\n')}\n\nRewrite these ${questions.length} questions:\n${JSON.stringify(strippedQuestions)}`;
}

/** Extract JSON from AI response — handles raw JSON, markdown code blocks, and object wrappers */
function extractJSON(raw: string): unknown {
  let text = raw.trim();

  // Strip markdown code blocks
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
  }

  const parsed = JSON.parse(text);

  // If AI wrapped in {"questions": [...]}, unwrap
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.questions)) {
    return parsed.questions;
  }

  return parsed;
}

function validateResponse(
  parsed: unknown,
  expectedIds: { qId: string; optionIds: [string, string] }[]
): PersonalizedQuestionOutput[] | null {
  if (!Array.isArray(parsed)) {
    console.error('[API] Validation: expected array, got', typeof parsed);
    return null;
  }
  if (parsed.length !== expectedIds.length) {
    console.error(`[API] Validation: expected ${expectedIds.length} questions, got ${parsed.length}`);
    return null;
  }

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
      console.error(`[API] Validation: question ${i} has invalid structure`, item);
      return null;
    }

    if (item.id !== expected.qId) {
      console.error(`[API] Validation: question ${i} ID mismatch — expected "${expected.qId}", got "${item.id}"`);
      return null;
    }

    if (
      typeof item.options[0]?.id !== 'string' ||
      typeof item.options[0]?.text !== 'string' ||
      typeof item.options[1]?.id !== 'string' ||
      typeof item.options[1]?.text !== 'string'
    ) {
      console.error(`[API] Validation: question ${i} options have invalid structure`);
      return null;
    }

    if (
      item.options[0].id !== expected.optionIds[0] ||
      item.options[1].id !== expected.optionIds[1]
    ) {
      console.error(`[API] Validation: question ${i} option IDs mismatch — expected [${expected.optionIds}], got [${item.options[0].id}, ${item.options[1].id}]`);
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

    console.log(`[API] Received request for chunk ${body.chunk} (${body.questions?.length} questions)`);
    console.log(`[API] Context: ${body.context?.lifeStage} / ${body.context?.workEnvironment}`, {
      lifeStageDetail: body.context?.lifeStageDetail,
      workEnvironmentDetail: body.context?.workEnvironmentDetail,
    });

    // Basic validation
    if (
      !body.chunk ||
      !Array.isArray(body.questions) ||
      body.questions.length === 0 ||
      !body.context
    ) {
      console.error('[API] Invalid request body:', { chunk: body.chunk, questionsLen: body.questions?.length, hasContext: !!body.context });
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

    console.log(`[API] Calling Claude Sonnet for chunk ${body.chunk}...`);
    const startTime = Date.now();
    const client = getClient();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      temperature: 0.7,
      system: [
        {
          type: 'text' as const,
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' as const },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const elapsed = Date.now() - startTime;
    console.log(`[API] Claude responded in ${elapsed}ms — stop_reason: ${response.stop_reason}`);
    console.log(`[API] Usage: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}, cache_read=${response.usage.cache_read_input_tokens}, cache_create=${response.usage.cache_creation_input_tokens}`);

    // Extract text from response
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      console.error('[API] No text block in response. Content types:', response.content.map((b) => b.type));
      return Response.json({ error: 'No text response from AI' }, { status: 502 });
    }

    console.log(`[API] Raw AI response (first 500 chars):`, textBlock.text.slice(0, 500));

    // Parse JSON response (handles markdown wrapping, object wrapper)
    let parsed: unknown;
    try {
      parsed = extractJSON(textBlock.text);
    } catch (parseErr) {
      console.error('[API] JSON parse failed:', parseErr);
      console.error('[API] Full raw text:', textBlock.text);
      return Response.json({ error: 'AI returned invalid JSON' }, { status: 502 });
    }

    // Validate structure and IDs
    const validated = validateResponse(parsed, expectedIds);
    if (!validated) {
      console.error('[API] Validation failed. Parsed data:', JSON.stringify(parsed).slice(0, 500));
      return Response.json({ error: 'AI response failed validation' }, { status: 502 });
    }

    console.log(`[API] Chunk ${body.chunk}: successfully personalized ${validated.length} questions`);

    const result: PersonalizeResponse = { questions: validated };
    return Response.json(result);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.error('[API] Rate limited by Anthropic');
      return Response.json({ error: 'Rate limited' }, { status: 429 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('[API] Anthropic API key invalid');
      return Response.json({ error: 'API key invalid' }, { status: 401 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`[API] Anthropic API error (${error.status}):`, error.message);
      return Response.json({ error: `AI service error: ${error.message}` }, { status: 502 });
    }
    console.error('[API] Unexpected error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
