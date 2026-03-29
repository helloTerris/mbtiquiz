'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { GapAnalysis } from '@/components/consensus/GapAnalysis';
import { FunctionBars } from '@/components/results/FunctionBars';
import { Button } from '@/components/ui/Button';
import { useConsensusStore } from '@/stores/consensus-store';
import { useHydration } from '@/hooks/useHydration';
import { getOthersAverage, aggregateScores } from '@/engine/consensus/vote-aggregator';
import { analyzeGaps } from '@/engine/consensus/gap-analyzer';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { ALL_FUNCTIONS, createEmptyScores } from '@/types/cognitive-functions';

export default function ConsensusResultsPage() {
  const params = useParams();
  const router = useRouter();
  const hydrated = useHydration();

  const sessionId = params.sessionId as string;
  const session = useConsensusStore((s) => s.getSession(sessionId));

  const analysis = useMemo(() => {
    if (!session) return null;

    const selfScores =
      session.selfResult?.functionScores as Record<CognitiveFunction, number> | undefined ??
      createEmptyScores();

    const othersScores = getOthersAverage(session);
    const aggregated = aggregateScores(selfScores, session);
    const gaps = analyzeGaps(selfScores, othersScores);

    // Rank by aggregated scores
    const rankings = [...ALL_FUNCTIONS].sort(
      (a, b) => aggregated[b] - aggregated[a]
    );

    return { selfScores, othersScores, aggregated, gaps, rankings };
  }, [session]);

  if (!hydrated) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-muted">Session not found.</p>
        <Button variant="secondary" onClick={() => router.push('/')}>
          Go Home
        </Button>
      </main>
    );
  }

  if (session.votes.length === 0) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-xl font-bold text-foreground">
          No votes yet for {session.subjectName}
        </h2>
        <p className="text-sm text-muted text-center max-w-md">
          Share the session link with friends and ask them to type you.
          Come back here once they have completed their assessments.
        </p>
        <Button variant="secondary" onClick={() => router.push(`/consensus`)}>
          Back to Consensus
        </Button>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl font-bold text-foreground mb-1">
            <span className="gradient-text">{session.subjectName}</span>
          </h1>
          <p className="text-sm font-mono text-muted">
            Consensus from {session.votes.length} voter{session.votes.length !== 1 ? 's' : ''}
            {session.selfResult ? ' + self-assessment' : ''}
          </p>
        </motion.div>

        {analysis && (
          <>
            {/* Aggregated function bars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-4">
                Aggregated Profile (50% Self + 50% Others)
              </h3>
              <FunctionBars
                scores={analysis.aggregated}
                rankings={analysis.rankings}
              />
            </motion.div>

            {/* Gap analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GapAnalysis
                gaps={analysis.gaps}
                selfScores={analysis.selfScores}
                othersScores={analysis.othersScores}
              />
            </motion.div>

            {/* Voter list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-3">
                Voters
              </h3>
              <div className="space-y-2">
                {session.votes.map((vote) => (
                  <div
                    key={vote.voterId}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface/50"
                  >
                    <span className="text-sm text-foreground">{vote.voterName}</span>
                    <span className="text-xs text-muted font-mono">
                      {new Date(vote.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 justify-center pt-4 pb-8"
        >
          <Button variant="secondary" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
