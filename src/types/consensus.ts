import type { CognitiveFunction } from './cognitive-functions';
import type { QuizResult } from './results';

export interface ConsensusSession {
  id: string;
  createdAt: number;
  subjectName: string;
  selfResult?: QuizResult;
  votes: ConsensusVote[];
}

export interface ConsensusVote {
  voterId: string;
  voterName: string;
  scores: Record<CognitiveFunction, number>;
  completedAt: number;
}

export interface ConsensusGap {
  function: CognitiveFunction;
  selfScore: number;
  othersScore: number;
  delta: number;
  interpretation: string;
}
