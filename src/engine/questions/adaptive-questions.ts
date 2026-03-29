import type { Question } from '@/types/questions';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import type { NormalizedScores } from '@/types/scoring';
import { detectAmbiguousPairs } from '../scoring/normalizer';

/**
 * Adaptive follow-up questions triggered when function pairs are too close.
 * These use scenario-based and default-vs-forced framing to resolve ambiguity.
 */
const ADAPTIVE_POOL: (Question & { triggeredBy: [CognitiveFunction, CognitiveFunction] })[] = [
  // Ti vs Te resolvers
  {
    id: 'adp-ti-te-1',
    primaryAxis: ['Ti', 'Te'],
    triggeredBy: ['Ti', 'Te'],
    category: 'decision-making',
    text: 'You made something that works great, but you can\'t fully explain why it works. Do you:',
    options: [
      {
        id: 'adp-ti-te-1-a',
        text: 'Dig into it until you figure out exactly why it works — you need to understand the principle behind it.',
        functionWeights: { Ti: 2.5 },
      },
      {
        id: 'adp-ti-te-1-b',
        text: 'Move on — it works, and that\'s what matters. Your time is better spent on the next thing.',
        functionWeights: { Te: 2.5 },
      },
    ],
    isDefaultVsForced: true,
    chunk: 5,
    weight: 1.3,
  },
  {
    id: 'adp-ti-te-2',
    primaryAxis: ['Ti', 'Te'],
    triggeredBy: ['Ti', 'Te'],
    category: 'work-style',
    text: 'Think of the last time you learned a new skill. Did you:',
    options: [
      {
        id: 'adp-ti-te-2-a',
        text: 'Need to understand the theory first before you felt okay actually doing it.',
        functionWeights: { Ti: 2.5 },
      },
      {
        id: 'adp-ti-te-2-b',
        text: 'Jump right in and start practicing, picking up the theory as you go.',
        functionWeights: { Te: 2.5 },
      },
    ],
    chunk: 5,
    weight: 1.3,
  },

  // Fi vs Fe resolvers
  {
    id: 'adp-fi-fe-1',
    primaryAxis: ['Fi', 'Fe'],
    triggeredBy: ['Fi', 'Fe'],
    category: 'social-interaction',
    text: 'A friend asks how you\'re doing, and honestly you\'re not great. You:',
    options: [
      {
        id: 'adp-fi-fe-1-a',
        text: 'Only open up if you truly trust them — you don\'t share what\'s real just because someone asks.',
        functionWeights: { Fi: 2.5 },
      },
      {
        id: 'adp-fi-fe-1-b',
        text: 'Read the moment — if they seem ready to listen you might share, but if it\'d make things heavy you keep it light.',
        functionWeights: { Fe: 2.5 },
      },
    ],
    chunk: 5,
    weight: 1.3,
  },
  {
    id: 'adp-fi-fe-2',
    primaryAxis: ['Fi', 'Fe'],
    triggeredBy: ['Fi', 'Fe'],
    category: 'inner-world',
    text: 'When a movie really gets to you emotionally:',
    options: [
      {
        id: 'adp-fi-fe-2-a',
        text: 'You feel it deeply but keep it inside — you might cry alone, but you\'d hold back in a packed theater.',
        functionWeights: { Fi: 2.5 },
      },
      {
        id: 'adp-fi-fe-2-b',
        text: 'It hits even harder with people around — crying with friends or a crowd makes the feeling bigger, not awkward.',
        functionWeights: { Fe: 2.5 },
      },
    ],
    chunk: 5,
    weight: 1.3,
  },

  // Ni vs Ne resolvers
  {
    id: 'adp-ni-ne-1',
    primaryAxis: ['Ni', 'Ne'],
    triggeredBy: ['Ni', 'Ne'],
    category: 'information-processing',
    text: 'When you read about something new, your brain:',
    options: [
      {
        id: 'adp-ni-ne-1-a',
        text: 'Tries to find the one big takeaway — you keep asking "but what does this really mean?"',
        functionWeights: { Ni: 2.5 },
      },
      {
        id: 'adp-ni-ne-1-b',
        text: 'Goes off in a million directions — you keep asking "what else could this relate to?" and end up way off topic.',
        functionWeights: { Ne: 2.5 },
      },
    ],
    chunk: 5,
    weight: 1.3,
  },

  // Si vs Se resolvers
  {
    id: 'adp-si-se-1',
    primaryAxis: ['Si', 'Se'],
    triggeredBy: ['Si', 'Se'],
    category: 'default-vs-forced',
    text: 'If you could relive any moment from your past or experience something totally new, you\'d choose:',
    options: [
      {
        id: 'adp-si-se-1-a',
        text: 'Reliving a favorite memory exactly as it happened — there\'s something warm about going back to what you loved.',
        functionWeights: { Si: 2.5 },
      },
      {
        id: 'adp-si-se-1-b',
        text: 'Something completely new — the thrill of the unknown and doing something you\'ve never done before.',
        functionWeights: { Se: 2.5 },
      },
    ],
    isDefaultVsForced: true,
    chunk: 5,
    weight: 1.3,
  },
];

/**
 * Select adaptive questions to resolve ambiguous function pairs.
 * Returns up to maxCount questions targeting the most ambiguous pairs.
 */
export function selectAdaptiveQuestions(
  normalizedScores: NormalizedScores,
  answeredIds: Set<string>,
  maxCount: number = 5,
  threshold?: number
): Question[] {
  const ambiguousPairs = detectAmbiguousPairs(normalizedScores, threshold);
  if (ambiguousPairs.length === 0) return [];

  const selected: Question[] = [];

  for (const [funcA, funcB] of ambiguousPairs) {
    const candidates = ADAPTIVE_POOL.filter(q => {
      const [trigA, trigB] = q.triggeredBy;
      return (
        ((trigA === funcA && trigB === funcB) || (trigA === funcB && trigB === funcA)) &&
        !answeredIds.has(q.id)
      );
    });

    // Take up to 2 per ambiguous pair
    selected.push(...candidates.slice(0, 2));
  }

  return selected.slice(0, maxCount);
}
