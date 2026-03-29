import type { FunctionStack } from '@/types/stacks';
import type { NormalizedScores } from '@/types/scoring';
import type { StressProfile } from '@/types/results';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { FUNCTION_LABELS } from '@/lib/constants';

const GRIP_BEHAVIORS: Record<CognitiveFunction, string[]> = {
  Fe: [
    'Uncharacteristic emotional outbursts',
    'Sudden need for external validation',
    'Hypersensitivity to criticism',
    'Feeling misunderstood by everyone',
  ],
  Fi: [
    'Rigid moralistic judgments',
    'Withdrawing into personal values as absolute truths',
    'Feeling that no one shares your values',
    'Black-and-white thinking about right and wrong',
  ],
  Te: [
    'Obsessive need to control and organize',
    'Harsh criticism of others\' competence',
    'Rigid adherence to rules and systems',
    'Fixating on external metrics of success',
  ],
  Ti: [
    'Paralysis by analysis',
    'Obsessive logical loop-seeking',
    'Dismissing all external input as irrational',
    'Retreating into abstract frameworks disconnected from reality',
  ],
  Se: [
    'Impulsive sensory overindulgence',
    'Reckless physical behavior',
    'Obsessive focus on appearance or physical details',
    'Binge eating, spending, or thrill-seeking',
  ],
  Si: [
    'Obsessive fixation on past mistakes',
    'Hypochondria or body-focused anxiety',
    'Rigid clinging to routines as comfort',
    'Inability to move forward from past events',
  ],
  Ne: [
    'Catastrophic worst-case-scenario spiraling',
    'Paranoid pattern-matching (everything is a bad sign)',
    'Inability to commit to any single path',
    'Overwhelm from seeing too many negative possibilities',
  ],
  Ni: [
    'Dark, fatalistic visions of the future',
    'Tunnel vision on a single catastrophic outcome',
    'Feeling that doom is inevitable and inescapable',
    'Sudden mystical or paranoid convictions',
  ],
};

export function profileStress(
  stack: FunctionStack,
  normalizedScores: NormalizedScores
): StressProfile {
  const inferiorFn = stack.inferior;
  const infLabel = FUNCTION_LABELS[inferiorFn] || inferiorFn;

  const gripBehaviors = GRIP_BEHAVIORS[inferiorFn] || [];

  // Check how much the inferior function actually showed up in scores
  const infRank = normalizedScores.rankings.indexOf(inferiorFn);
  // If inferior is actually ranked high, that might indicate stress grip
  const stressQuestionAlignment = infRank <= 3 ? 30 : infRank <= 5 ? 60 : 85;

  const description = `Under extreme stress, ${stack.type} types may fall into the grip of their inferior function, ${infLabel} (${inferiorFn}). This manifests as uncharacteristic behavior that feels foreign to your normal self.`;

  return {
    inferiorFunction: inferiorFn,
    gripBehaviors,
    stressQuestionAlignment,
    description,
  };
}
