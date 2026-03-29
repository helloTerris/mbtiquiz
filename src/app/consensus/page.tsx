'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { ShareLinkGenerator } from '@/components/consensus/ShareLinkGenerator';
import { useConsensusStore } from '@/stores/consensus-store';
import { useResultsStore } from '@/stores/results-store';
import { useHydration } from '@/hooks/useHydration';

export default function ConsensusEntryPage() {
  const router = useRouter();
  const hydrated = useHydration();
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const createSession = useConsensusStore((s) => s.createNewSession);
  const setSelfResult = useConsensusStore((s) => s.setSelfResult);
  const selfResult = useResultsStore((s) => s.result);

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = createSession(name.trim());
    if (selfResult) {
      setSelfResult(id, selfResult);
    }
    setSessionId(id);
  };

  if (!hydrated) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-sm font-mono text-muted mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-glow" />
            Collaborative Typing
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-[-0.02em]">
            <span className="gradient-text">Consensus Mode</span>
          </h1>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            Create a session and share the link with friends.
            They answer questions about you, and you see how their perception
            compares to your self-assessment.
          </p>
        </div>

        {!sessionId ? (
          <div className="glass rounded-2xl p-6 space-y-5">
            <div>
              <label className="text-sm font-mono text-muted uppercase tracking-[0.1em] block mb-2">
                Your name or nickname
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all duration-200"
              />
            </div>

            {!selfResult && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                <span className="text-amber-400 text-sm mt-px">&#x26A0;</span>
                <p className="text-sm text-amber-400 leading-relaxed">
                  Take the test yourself first for the best comparison. You can still create a session without it.
                </p>
              </div>
            )}

            <Button
              variant="primary"
              className="w-full"
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              Create Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <ShareLinkGenerator sessionId={sessionId} />

            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-sm text-muted mb-5 leading-relaxed">
                Share this link with friends. Once they complete their assessments,
                come back here to view the comparison.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push(`/consensus/${sessionId}/results`)}
              >
                View Results
              </Button>
            </div>

            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
