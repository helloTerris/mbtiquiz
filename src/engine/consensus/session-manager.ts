import type { ConsensusSession, ConsensusVote } from '@/types/consensus';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function createSession(subjectName: string): ConsensusSession {
  return {
    id: generateId(),
    createdAt: Date.now(),
    subjectName,
    votes: [],
  };
}

export function addVoteToSession(
  session: ConsensusSession,
  vote: ConsensusVote
): ConsensusSession {
  return {
    ...session,
    votes: [...session.votes, vote],
  };
}

/**
 * Encode session ID into a shareable URL path.
 * In a real app this would be a backend endpoint; for MVP we use
 * localStorage-based sessions identified by ID in the URL.
 */
export function getShareUrl(sessionId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/consensus/${sessionId}`;
}
