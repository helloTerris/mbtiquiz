'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { VoterForm } from '@/components/consensus/VoterForm';
import { Button } from '@/components/ui/Button';
import { useConsensusStore } from '@/stores/consensus-store';
import { useHydration } from '@/hooks/useHydration';
import type { ConsensusVote } from '@/types/consensus';

export default function VoterPage() {
  const params = useParams();
  const router = useRouter();
  const hydrated = useHydration();
  const [submitted, setSubmitted] = useState(false);

  const sessionId = params.sessionId as string;
  const session = useConsensusStore((s) => s.getSession(sessionId));
  const addVote = useConsensusStore((s) => s.addVote);

  const handleSubmit = (vote: ConsensusVote) => {
    addVote(sessionId, vote);
    setSubmitted(true);
  };

  if (!hydrated) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted text-center">
          Session not found. The link may be invalid, or the session was created on a different device.
        </p>
        <p className="text-xs text-muted text-center max-w-sm">
          Note: Consensus sessions are stored locally. Both you and the session creator
          need to be on the same device, or the session creator needs to share their
          session data with you.
        </p>
        <Button variant="secondary" onClick={() => router.push('/')}>
          Go Home
        </Button>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">&#x2705;</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Thanks!</h2>
          <p className="text-muted mb-6">
            Your assessment of {session.subjectName} has been recorded.
          </p>
          <Button variant="secondary" onClick={() => router.push('/')}>
            Take Your Own Test
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <VoterForm subjectName={session.subjectName} onSubmit={handleSubmit} />
    </main>
  );
}
