import type { CognitiveFunction } from './cognitive-functions';
import type { QuestionCategory } from './questions';

/** Stripped-down question sent to the API — no functionWeights for security */
export interface QuestionForAI {
  id: string;
  primaryAxis: [CognitiveFunction, CognitiveFunction];
  category: QuestionCategory;
  text: string;
  options: [{ id: string; text: string }, { id: string; text: string }];
}

/** Context projection for the AI — excludes scoring-only fields */
export interface AIContext {
  lifeStage: string;
  lifeStageDetail?: string;
  workEnvironment: string;
  workEnvironmentDetail?: string;
  dailyStructure: string;
  socialExposure: string;
  livingSituation: string;
  stressLevel: string;
  isTypingOther: boolean;
  otherPersonName?: string;
}

/** Request body for POST /api/personalize-questions */
export interface PersonalizeRequest {
  chunk: number;
  questions: QuestionForAI[];
  context: AIContext;
}

/** A single rewritten question from the AI */
export interface PersonalizedQuestionOutput {
  id: string;
  text: string;
  options: [{ id: string; text: string }, { id: string; text: string }];
}

/** Response from POST /api/personalize-questions */
export interface PersonalizeResponse {
  questions: PersonalizedQuestionOutput[];
}
