import type { CognitiveFunction } from './cognitive-functions';
import type { StackMatch } from './stacks';
import type { ConfidenceMetrics, Contradiction, BiasIndicator } from './scoring';

export interface LoopState {
  detected: boolean;
  loopFunctions: [CognitiveFunction, CognitiveFunction] | null; // [dom, tert]
  suppressedFunction: CognitiveFunction | null;                  // aux
  severity: 'mild' | 'moderate' | 'strong' | null;
  description: string | null;
}

export interface QuizResult {
  primaryType: StackMatch;
  alternativeTypes: StackMatch[];
  functionScores: Record<CognitiveFunction, number>;
  confidence: ConfidenceMetrics;
  contradictions: Contradiction[];
  biasIndicators: BiasIndicator[];
  explanations: TypeExplanation;
  stressProfile: StressProfile;
  trueSelfAnalysis: TrueSelfAnalysis | null;
  loopState: LoopState;
  completedAt: number;
  isShared?: boolean;
}

export interface TypeExplanation {
  summary: string;
  functionExplanations: Partial<Record<CognitiveFunction, string>>;
  stackExplanation: string;
  caveat: string;
}

export interface StressProfile {
  inferiorFunction: CognitiveFunction;
  gripBehaviors: string[];
  stressQuestionAlignment: number; // 0-100
  description: string;
}

export interface TrueSelfAnalysis {
  naturalScores: Record<CognitiveFunction, number>;
  adaptedScores: Record<CognitiveFunction, number>;
  divergencePoints: DivergencePoint[];
}

export interface DivergencePoint {
  function: CognitiveFunction;
  naturalScore: number;
  adaptedScore: number;
  possibleCause: string;
}
