import type { CognitiveFunction } from './cognitive-functions';

export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface FunctionStack {
  type: MBTIType;
  dominant: CognitiveFunction;
  auxiliary: CognitiveFunction;
  tertiary: CognitiveFunction;
  inferior: CognitiveFunction;
}

export interface StackMatch {
  type: MBTIType;
  stack: FunctionStack;
  fitScore: number;      // 0-100
  confidence: number;    // 0-100
  probability: number;   // 0-1
  gaps: StackGap[];
}

export interface StackGap {
  position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior';
  expected: CognitiveFunction;
  expectedRank: number;
  actualRank: number;
  severity: 'minor' | 'moderate' | 'major';
}
