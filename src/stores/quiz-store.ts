'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Answer, Question } from '@/types/questions';
import type { RawScores, NormalizedScores } from '@/types/scoring';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import type { MBTIType } from '@/types/stacks';
import { accumulateScore, accumulateAllScores, createEmptyRawScores } from '@/engine/scoring/score-accumulator';
import { normalize } from '@/engine/scoring/normalizer';
import { CORE_QUESTIONS } from '@/engine/questions/question-bank';
import { useContextStore } from './context-store';

export type QuizPhase = 'idle' | 'context' | 'test' | 'refine' | 'results';

interface QuizState {
  phase: QuizPhase;
  currentChunk: number;
  currentQuestionIndex: number;
  answers: Answer[];
  rawScores: RawScores;
  normalizedScores: NormalizedScores | null;
  liveRankings: CognitiveFunction[];
  liveBestGuess: MBTIType | null;
  adaptiveQuestionsNeeded: boolean;

  setPhase: (phase: QuizPhase) => void;
  submitAnswer: (answer: Answer, question: Question) => void;
  nextQuestion: () => void;
  nextChunk: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAdaptiveNeeded: (needed: boolean) => void;
  setLiveBestGuess: (type: MBTIType | null) => void;
  goBack: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      phase: 'idle',
      currentChunk: 1,
      currentQuestionIndex: 0,
      answers: [],
      rawScores: createEmptyRawScores(),
      normalizedScores: null,
      liveRankings: [],
      liveBestGuess: null,
      adaptiveQuestionsNeeded: false,

      setPhase: (phase) => set({ phase }),

      submitAnswer: (answer, question) => {
        const { rawScores, answers } = get();
        const context = useContextStore.getState().context;
        const newRawScores = accumulateScore(rawScores, answer, question, context);
        const newNormalized = normalize(newRawScores);

        set({
          rawScores: newRawScores,
          normalizedScores: newNormalized,
          answers: [...answers, answer],
          liveRankings: newNormalized.rankings,
        });
      },

      nextQuestion: () => {
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        }));
      },

      nextChunk: () => {
        set((state) => ({
          currentChunk: state.currentChunk + 1,
          currentQuestionIndex: 0,
        }));
      },

      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      setAdaptiveNeeded: (needed) => set({ adaptiveQuestionsNeeded: needed }),
      setLiveBestGuess: (type) => set({ liveBestGuess: type }),

      goBack: () => {
        const { answers, currentQuestionIndex, currentChunk } = get();
        if (answers.length === 0) return;

        // Remove the last answer
        const newAnswers = answers.slice(0, -1);

        // Recompute scores from scratch with context
        const context = useContextStore.getState().context;
        const newRawScores = accumulateAllScores(newAnswers, CORE_QUESTIONS, context);
        const newNormalized = newAnswers.length > 0 ? normalize(newRawScores) : null;

        if (currentQuestionIndex > 0) {
          // Go to previous question in same chunk
          set({
            answers: newAnswers,
            rawScores: newRawScores,
            normalizedScores: newNormalized,
            liveRankings: newNormalized?.rankings ?? [],
            currentQuestionIndex: currentQuestionIndex - 1,
          });
        } else if (currentChunk > 1) {
          // Go to last question of previous chunk (chunk has 10 questions, index 9)
          set({
            answers: newAnswers,
            rawScores: newRawScores,
            normalizedScores: newNormalized,
            liveRankings: newNormalized?.rankings ?? [],
            currentChunk: currentChunk - 1,
            currentQuestionIndex: 9,
          });
        }
      },

      reset: () =>
        set({
          phase: 'idle',
          currentChunk: 1,
          currentQuestionIndex: 0,
          answers: [],
          rawScores: createEmptyRawScores(),
          normalizedScores: null,
          liveRankings: [],
          liveBestGuess: null,
          adaptiveQuestionsNeeded: false,
        }),
    }),
    {
      name: 'cognitivtype-quiz',
    }
  )
);
