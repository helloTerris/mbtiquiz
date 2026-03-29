// The 8 Jungian cognitive functions
export type CognitiveFunction =
  | 'Ti' | 'Te'
  | 'Fi' | 'Fe'
  | 'Ni' | 'Ne'
  | 'Si' | 'Se';

export const ALL_FUNCTIONS: CognitiveFunction[] = [
  'Ti', 'Te', 'Fi', 'Fe', 'Ni', 'Ne', 'Si', 'Se',
];

// Axis pairs: dominant↔inferior linkage
export const AXIS_PAIRS: [CognitiveFunction, CognitiveFunction][] = [
  ['Ti', 'Fe'],
  ['Te', 'Fi'],
  ['Ni', 'Se'],
  ['Ne', 'Si'],
];

// Opposition pairs used in forced-choice questions (same process, different attitude)
export const QUESTION_PAIRS: [CognitiveFunction, CognitiveFunction][] = [
  ['Ti', 'Te'],
  ['Fi', 'Fe'],
  ['Ni', 'Ne'],
  ['Si', 'Se'],
];

export type FunctionAttitude = 'introverted' | 'extraverted';
export type FunctionProcess = 'thinking' | 'feeling' | 'intuition' | 'sensing';

export interface FunctionProfile {
  function: CognitiveFunction;
  rawScore: number;
  normalizedScore: number; // 0-100
  questionCount: number;
  consistency: number; // 0-1
}

export type FunctionScoreMap = Record<CognitiveFunction, number>;

export function getAttitude(fn: CognitiveFunction): FunctionAttitude {
  return fn.endsWith('i') ? 'introverted' : 'extraverted';
}

export function getProcess(fn: CognitiveFunction): FunctionProcess {
  const letter = fn[0];
  switch (letter) {
    case 'T': return 'thinking';
    case 'F': return 'feeling';
    case 'N': return 'intuition';
    case 'S': return 'sensing';
    default: throw new Error(`Invalid function: ${fn}`);
  }
}

export function getOpposite(fn: CognitiveFunction): CognitiveFunction {
  for (const [a, b] of AXIS_PAIRS) {
    if (fn === a) return b;
    if (fn === b) return a;
  }
  throw new Error(`No axis pair for: ${fn}`);
}

export function createEmptyScores(): FunctionScoreMap {
  return { Ti: 0, Te: 0, Fi: 0, Fe: 0, Ni: 0, Ne: 0, Si: 0, Se: 0 };
}
