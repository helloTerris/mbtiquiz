import type { LifeStage } from '@/types/context';

export const QUESTIONS_PER_CHUNK = 10;
export const TOTAL_CHUNKS = 4;
export const AMBIGUITY_THRESHOLD = 12;
export const MAX_ADAPTIVE_QUESTIONS = 5;

/**
 * Older/more experienced users naturally develop tertiary and inferior
 * functions, so close scores are more expected. A wider threshold means
 * fewer pairs are flagged as "ambiguous" and fewer adaptive questions fire.
 */
const AMBIGUITY_BY_LIFE_STAGE: Record<LifeStage, number> = {
  'student': 12,
  'early-career': 14,
  'mid-career': 16,
  'other': 12,
};

export function getAmbiguityThreshold(lifeStage?: LifeStage | null): number {
  if (!lifeStage) return AMBIGUITY_THRESHOLD;
  return AMBIGUITY_BY_LIFE_STAGE[lifeStage];
}

// Scoring weights for stack position matching
export const POSITION_WEIGHTS = {
  dominant: 40,
  auxiliary: 30,
  tertiary: 15,
  inferior: 15,
} as const;

// Confidence factor weights
export const CONFIDENCE_WEIGHTS = {
  margin: 0.4,
  consistency: 0.3,
  responseTime: 0.15,
  polarization: 0.15,
} as const;

// Function colors for UI
export const FUNCTION_COLORS: Record<string, string> = {
  Ti: '#6366f1', // indigo
  Te: '#8b5cf6', // violet
  Fi: '#ec4899', // pink
  Fe: '#f43f5e', // rose
  Ni: '#06b6d4', // cyan
  Ne: '#14b8a6', // teal
  Si: '#f59e0b', // amber
  Se: '#f97316', // orange
};

export const FUNCTION_LABELS: Record<string, string> = {
  Ti: 'Introverted Thinking',
  Te: 'Extraverted Thinking',
  Fi: 'Introverted Feeling',
  Fe: 'Extraverted Feeling',
  Ni: 'Introverted Intuition',
  Ne: 'Extraverted Intuition',
  Si: 'Introverted Sensing',
  Se: 'Extraverted Sensing',
};
