'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useQuizStore } from '@/stores/quiz-store';
import { useContextStore } from '@/stores/context-store';
import { useResultsStore } from '@/stores/results-store';
import { generatePresetAnswers } from '@/lib/dev-presets';
import { CORE_QUESTIONS } from '@/engine/questions/question-bank';
import { STRESS_QUESTIONS } from '@/engine/questions/stress-questions';
import type { MBTIType } from '@/types/stacks';

const MBTI_TYPES: MBTIType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISTP', 'ESTJ', 'ESTP',
  'ISFJ', 'ISFP', 'ESFJ', 'ESFP',
];

export default function LandingPage() {
  const router = useRouter();
  const resetQuiz = useQuizStore((s) => s.reset);
  const clearContext = useContextStore((s) => s.clear);
  const clearResults = useResultsStore((s) => s.clear);
  const [devOpen, setDevOpen] = useState(false);

  const allQuestions = [...CORE_QUESTIONS, ...STRESS_QUESTIONS];

  const handlePreset = (type: MBTIType) => {
    resetQuiz();
    clearContext();
    clearResults();

    // Generate synthetic answers and feed them through the quiz store
    // so the results page runs the real engine pipeline
    const answers = generatePresetAnswers(type);
    const store = useQuizStore.getState();
    for (const answer of answers) {
      const question = allQuestions.find(q => q.id === answer.questionId);
      if (question) store.submitAnswer(answer, question);
    }
    store.setPhase('results');
    router.push('/quiz/results');
  };

  const handleStart = () => {
    resetQuiz();
    clearContext();
    clearResults();
    router.push('/quiz/context');
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl text-center">
        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-sm font-mono text-muted mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-bright animate-pulse-glow" />
            Jungian Cognitive Typing
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.03em] mb-5">
            <span className="gradient-text">CognitivType</span>
          </h1>
          <p className="text-base md:text-lg text-muted max-w-lg mx-auto leading-relaxed">
            Discover your cognitive function stack through behavioral analysis.
            Not a personality quiz — a typing system.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-8 mb-12"
        >
          {[
            'Forced Tradeoffs',
            'Function Stacks',
            'Adaptive Questions',
            'Confidence Scoring',
            'Contradiction Detection',
          ].map((feature, i) => (
            <motion.span
              key={feature}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="px-3 py-1.5 text-sm font-mono text-muted rounded-lg border border-border bg-surface/30"
            >
              {feature}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid gap-4 md:grid-cols-2 max-w-lg mx-auto"
        >
          <GlassPanel hover className="text-center relative overflow-hidden">
            {/* Subtle gradient accent on hover card */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg">&#x1f9e0;</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Type Yourself</h3>
              <p className="text-sm text-muted leading-relaxed">
                40 questions, ~10 minutes.
                <br />
                Forced choices, real cognition.
              </p>
              <Button variant="primary" size="sm" className="mt-5 w-full" onClick={handleStart}>
                Begin
              </Button>
            </div>
          </GlassPanel>

          <GlassPanel hover className="text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg">&#x1f465;</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Consensus Mode</h3>
              <p className="text-sm text-muted leading-relaxed">
                Have friends type you.
                <br />
                Compare self vs. others.
              </p>
              <Button variant="secondary" size="sm" className="mt-5 w-full" onClick={() => router.push('/consensus')}>
                Start Session
              </Button>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-muted mt-14"
        >
          Based on Jungian cognitive function theory. All data stays in your browser.
        </motion.p>

        {/* Dev-only preset panel — fixed bottom-right corner */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50">
            {!devOpen ? (
              <button
                onClick={() => setDevOpen(true)}
                className="px-3 py-2 text-xs font-mono rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer backdrop-blur-sm"
              >
                DEV
              </button>
            ) : (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-background/95 backdrop-blur-md shadow-2xl w-72">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-mono text-amber-400">Preset Results</p>
                  <button
                    onClick={() => setDevOpen(false)}
                    className="text-xs text-muted hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {MBTI_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handlePreset(type)}
                      className="px-1.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-surface/50 text-foreground hover:border-accent hover:bg-accent/10 transition-all cursor-pointer"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
