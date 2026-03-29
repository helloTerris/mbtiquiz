import type { CognitiveFunction } from './cognitive-functions';

export interface RawScores {
  scores: Record<CognitiveFunction, number>;
  questionCounts: Record<CognitiveFunction, number>;
}

export interface NormalizedScores {
  pairNormalized: Record<CognitiveFunction, number>;  // 0-100 within axis pair
  globalNormalized: Record<CognitiveFunction, number>; // 0-100 global
  rankings: CognitiveFunction[]; // sorted highest to lowest
}

export interface ConfidenceMetrics {
  overall: number;              // 0-100
  marginOfVictory: number;
  consistency: number;          // 0-100
  contradictionCount: number;
  responseTimeVariance: number;
  polarization: number;         // 0-100
  ambiguousPairs: [CognitiveFunction, CognitiveFunction][];
}

export interface Contradiction {
  questionId1: string;
  questionId2: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedFunctions: CognitiveFunction[];
}

export interface BiasIndicator {
  type: 'self-image' | 'environment-pressure' | 'social-desirability';
  description: string;
  affectedFunctions: CognitiveFunction[];
  magnitude: number; // 0-1
}
