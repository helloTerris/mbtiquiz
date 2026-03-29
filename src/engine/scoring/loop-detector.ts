import type { NormalizedScores } from '@/types/scoring';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import type { FunctionStack, MBTIType } from '@/types/stacks';
import { VALID_STACKS } from '@/engine/stacks/valid-stacks';

/**
 * Detect cognitive function loops.
 *
 * A "loop" occurs when someone over-relies on their dominant and tertiary
 * functions while suppressing the auxiliary. Because dom and tert share the
 * same attitude (both introverted or both extraverted), this creates an
 * imbalanced one-sided processing style.
 *
 * Examples:
 *   INTP in Ti-Si loop → over-analyses past data, ignores Ne exploration
 *   INTJ in Ni-Fi loop → stuck in internal vision + values, ignores Te action
 *   ENFP in Ne-Te loop → jumps between ideas and efficiency, ignores Fi values
 *
 * Detection criteria:
 *   1. Dominant ranks high (top 2)
 *   2. Tertiary ranks higher than auxiliary (tert above aux in rankings)
 *   3. The gap between tertiary and auxiliary is meaningful (not noise)
 */

export interface LoopIndicator {
  type: MBTIType;
  loopFunctions: [CognitiveFunction, CognitiveFunction]; // [dom, tert]
  suppressedFunction: CognitiveFunction;                  // aux
  severity: 'mild' | 'moderate' | 'strong';
  description: string;
  domRank: number;
  auxRank: number;
  tertRank: number;
}

const LOOP_DESCRIPTIONS: Record<string, string> = {
  'Ti-Si': 'You keep going over the same facts and past experiences in your head, but you\'re not trying anything new. It feels safe but you end up stuck.',
  'Ti-Ni': 'You\'re deep in your own head — thinking and theorizing nonstop — but you\'re not talking to anyone or doing anything about it. You might seem checked out.',
  'Te-Se': 'You\'re all about getting things done right now and seeing quick results, but you\'re skipping the bigger picture and deeper meaning.',
  'Te-Ne': 'You keep bouncing between organizing things and brainstorming new ideas, but you\'re ignoring how you (and others) actually feel about it.',
  'Fi-Si': 'You\'re reliving old feelings and memories a lot, but you\'re not letting new people or experiences in. Nostalgia has become a hiding spot.',
  'Fi-Ni': 'You\'re wrapped up in your personal vision of how things "should" be, but you\'re not connecting with the real world. People might think you\'re distant.',
  'Fe-Se': 'You\'re focused on what people around you think right now and chasing fun experiences, but you\'re not stopping to think deeper about things.',
  'Fe-Ne': 'You\'re trying to make everyone happy while chasing every new idea, but nothing actually gets finished and you feel scattered.',
  'Ni-Fi': 'You have a strong vision for how things should be but you can\'t seem to take action on it. Perfectionism and personal values are keeping you frozen.',
  'Ni-Ti': 'You\'re stuck in deep thinking and pattern-spotting, but you\'re not sharing your ideas or turning them into anything real.',
  'Ne-Te': 'You\'re coming up with tons of ideas and instantly trying to organize them all, but you\'re steamrolling over people\'s feelings in the process.',
  'Ne-Fe': 'You\'re exploring every possibility to keep the group happy, but nothing concrete gets done and you lose track of what you actually want.',
  'Si-Ti': 'You\'re doing things "the way they\'ve always been done" and backing it up with logic, but you\'re resisting anything new or different.',
  'Si-Fi': 'You\'re holding tight to your comfort zone and personal values, but you\'re shutting out new perspectives and other people\'s input.',
  'Se-Te': 'You\'re all action and efficiency — get it done now — but you\'re not stopping to think about why you\'re doing it or what it means.',
  'Se-Fe': 'You\'re caught up in group vibes and shared experiences, but you\'re not thinking things through logically or planning ahead.',
};

export function detectLoop(
  normalizedScores: NormalizedScores
): LoopIndicator | null {
  const { rankings, globalNormalized } = normalizedScores;

  // Check each valid stack to see if the user's scores suggest a loop for that type
  let strongestLoop: LoopIndicator | null = null;
  let highestSeverityScore = 0;

  for (const stack of VALID_STACKS) {
    const domRank = rankings.indexOf(stack.dominant);
    const auxRank = rankings.indexOf(stack.auxiliary);
    const tertRank = rankings.indexOf(stack.tertiary);

    // Criterion 1: dominant must be in top 2
    if (domRank > 1) continue;

    // Criterion 2: tertiary must rank ABOVE auxiliary
    if (tertRank >= auxRank) continue;

    // Criterion 3: meaningful gap between tert and aux scores
    const auxScore = globalNormalized[stack.auxiliary];
    const tertScore = globalNormalized[stack.tertiary];
    const gap = tertScore - auxScore;

    if (gap < 5) continue; // not enough to be meaningful

    // Compute severity based on how far aux has fallen
    const severity: 'mild' | 'moderate' | 'strong' =
      gap >= 20 ? 'strong' :
      gap >= 12 ? 'moderate' :
      'mild';

    const severityScore = gap + (auxRank - tertRank) * 5;

    if (severityScore > highestSeverityScore) {
      highestSeverityScore = severityScore;
      const loopKey = `${stack.dominant}-${stack.tertiary}`;
      strongestLoop = {
        type: stack.type,
        loopFunctions: [stack.dominant, stack.tertiary],
        suppressedFunction: stack.auxiliary,
        severity,
        description: LOOP_DESCRIPTIONS[loopKey] ?? `${stack.dominant}-${stack.tertiary} loop: auxiliary ${stack.auxiliary} is suppressed.`,
        domRank,
        auxRank,
        tertRank,
      };
    }
  }

  return strongestLoop;
}
