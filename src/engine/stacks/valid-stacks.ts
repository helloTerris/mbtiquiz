import type { FunctionStack, MBTIType } from '@/types/stacks';
import type { CognitiveFunction } from '@/types/cognitive-functions';

export const VALID_STACKS: FunctionStack[] = [
  // NT types
  { type: 'INTJ', dominant: 'Ni', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Se' },
  { type: 'INTP', dominant: 'Ti', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Fe' },
  { type: 'ENTJ', dominant: 'Te', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Fi' },
  { type: 'ENTP', dominant: 'Ne', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Si' },
  // NF types
  { type: 'INFJ', dominant: 'Ni', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Se' },
  { type: 'INFP', dominant: 'Fi', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Te' },
  { type: 'ENFJ', dominant: 'Fe', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Ti' },
  { type: 'ENFP', dominant: 'Ne', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Si' },
  // ST types
  { type: 'ISTJ', dominant: 'Si', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Ne' },
  { type: 'ISTP', dominant: 'Ti', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Fe' },
  { type: 'ESTJ', dominant: 'Te', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Fi' },
  { type: 'ESTP', dominant: 'Se', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Ni' },
  // SF types
  { type: 'ISFJ', dominant: 'Si', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Ne' },
  { type: 'ISFP', dominant: 'Fi', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Te' },
  { type: 'ESFJ', dominant: 'Fe', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Ti' },
  { type: 'ESFP', dominant: 'Se', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Ni' },
];

export function getStackByType(type: MBTIType): FunctionStack {
  const stack = VALID_STACKS.find(s => s.type === type);
  if (!stack) throw new Error(`Invalid type: ${type}`);
  return stack;
}

export function getStacksWithDominant(fn: CognitiveFunction): FunctionStack[] {
  return VALID_STACKS.filter(s => s.dominant === fn);
}
