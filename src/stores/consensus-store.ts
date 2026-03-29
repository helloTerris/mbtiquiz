'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConsensusSession, ConsensusVote } from '@/types/consensus';
import type { QuizResult } from '@/types/results';
import { createSession, addVoteToSession } from '@/engine/consensus/session-manager';

interface ConsensusState {
  sessions: Record<string, ConsensusSession>;
  activeSessionId: string | null;

  createNewSession: (subjectName: string) => string;
  setSelfResult: (sessionId: string, result: QuizResult) => void;
  addVote: (sessionId: string, vote: ConsensusVote) => void;
  getSession: (sessionId: string) => ConsensusSession | undefined;
  setActiveSession: (sessionId: string | null) => void;
}

export const useConsensusStore = create<ConsensusState>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeSessionId: null,

      createNewSession: (subjectName) => {
        const session = createSession(subjectName);
        set((state) => ({
          sessions: { ...state.sessions, [session.id]: session },
          activeSessionId: session.id,
        }));
        return session.id;
      },

      setSelfResult: (sessionId, result) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: { ...session, selfResult: result },
            },
          };
        });
      },

      addVote: (sessionId, vote) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: addVoteToSession(session, vote),
            },
          };
        });
      },

      getSession: (sessionId) => get().sessions[sessionId],
      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
    }),
    {
      name: 'cognitivtype-consensus',
    }
  )
);
