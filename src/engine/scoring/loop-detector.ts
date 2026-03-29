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
  'Ti-Si': 'Over-analyzing past experiences and details while avoiding new possibilities. May get stuck in rigid internal frameworks.',
  'Ti-Ni': 'Deeply absorbed in internal logic and singular vision while avoiding engaging with the external world. May appear withdrawn.',
  'Te-Se': 'Fixated on immediate efficiency and tangible results while ignoring deeper patterns and implications.',
  'Te-Ne': 'Jumping between external systems and brainstorming while neglecting internal values and harmony.',
  'Fi-Si': 'Dwelling on past emotional experiences while avoiding new connections. May become nostalgic or withdrawn.',
  'Fi-Ni': 'Lost in personal ideals and singular vision while avoiding external engagement. May seem disconnected from reality.',
  'Fe-Se': 'Over-focused on others\' immediate reactions and sensory stimulation while ignoring deeper insights.',
  'Fe-Ne': 'Chasing group approval and possibilities while neglecting practical details and personal stability.',
  'Ni-Fi': 'Stuck in internal vision and personal values while avoiding external action. May seem paralyzed by perfectionism.',
  'Ni-Ti': 'Deep in abstract theorizing and pattern recognition while avoiding sharing ideas or taking action externally.',
  'Ne-Te': 'Rapidly generating ideas and immediately trying to systematize them while ignoring personal values and others\' feelings.',
  'Ne-Fe': 'Exploring possibilities to please everyone while neglecting practical follow-through and personal grounding.',
  'Si-Ti': 'Rigid adherence to past procedures and internal logic while avoiding new experiences and external input.',
  'Si-Fi': 'Clinging to familiar routines and personal values while avoiding new perspectives and group engagement.',
  'Se-Te': 'Driven by immediate action and external efficiency while ignoring deeper meaning and personal reflection.',
  'Se-Fe': 'Focused on shared sensory experiences and group dynamics while ignoring internal logic and long-term planning.',
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
