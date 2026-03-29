import type { CognitiveFunction } from './cognitive-functions';
import type { LifeStage, WorkEnvironment } from './context';

export type QuestionCategory =
  | 'decision-making'
  | 'information-processing'
  | 'social-interaction'
  | 'stress-response'
  | 'work-style'
  | 'inner-world'
  | 'default-vs-forced';

export interface ChoiceOption {
  id: string;
  text: string;
  functionWeights: Partial<Record<CognitiveFunction, number>>;
}

export interface ContextVariant {
  lifeStage?: LifeStage;
  workEnvironment?: WorkEnvironment;
  questionText: string;
  options: [ChoiceOption, ChoiceOption];
}

export interface Question {
  id: string;
  primaryAxis: [CognitiveFunction, CognitiveFunction];
  category: QuestionCategory;
  text: string;
  options: [ChoiceOption, ChoiceOption];
  contextVariants?: ContextVariant[];
  redundancyOf?: string;
  ambiguityThreshold?: number;
  isDefaultVsForced?: boolean;
  chunk: number; // 1-4
  weight: number;
}

export interface Answer {
  questionId: string;
  selectedOptionId: string;
  timestamp: number;
  responseTimeMs: number;
  /** How strongly the user prefers this option. 1 = barely, 2 = somewhat, 3 = strongly */
  intensity: 1 | 2 | 3;
}
