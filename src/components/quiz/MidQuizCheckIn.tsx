'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import type { NormalizedScores } from '@/types/scoring';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { FUNCTION_LABELS, FUNCTION_COLORS } from '@/lib/constants';
import { matchToStacks } from '@/engine/stacks/stack-validator';

interface MidQuizCheckInProps {
  normalizedScores: NormalizedScores;
  totalAnswered: number;
  totalQuestions: number;
  onContinue: () => void;
}

// Fun one-liners for the top 2 function combos
const COMBO_TEASERS: Record<string, string> = {
  'Ti+Ne': 'You question everything and chase every "what if" — your brain never stops exploring.',
  'Ti+Se': 'You break things down logically and trust what you can see and touch right now.',
  'Ti+Ni': 'You dig deep into how things work and trust your gut about where things are heading.',
  'Ti+Si': 'You think in precise systems and rely on tried-and-true methods.',
  'Te+Ni': 'You get things done with a clear vision — efficiency meets foresight.',
  'Te+Se': 'You act fast, think practically, and deal with what\'s right in front of you.',
  'Te+Ne': 'You chase results and possibilities at the same time — always optimizing, always brainstorming.',
  'Te+Si': 'You value proven processes and measurable results — reliability is your superpower.',
  'Fi+Ne': 'You follow your heart and explore every possibility — authentic and endlessly curious.',
  'Fi+Se': 'You stay true to yourself and live in the moment — genuine and fully present.',
  'Fi+Ni': 'You have deep convictions and a strong sense of where things are heading.',
  'Fi+Si': 'You hold strong personal values and treasure the experiences that shaped you.',
  'Fe+Ni': 'You read people effortlessly and have a vision for how things should be.',
  'Fe+Se': 'You light up a room and respond to people and situations as they happen.',
  'Fe+Ne': 'You connect with everyone and see potential everywhere — the ultimate people-person with ideas.',
  'Fe+Si': 'You take care of people and remember every detail about what matters to them.',
  'Ni+Te': 'You see the big picture and make it happen — visionary with execution power.',
  'Ni+Fe': 'You sense what people need before they say it — intuitive and caring.',
  'Ni+Ti': 'You see patterns nobody else catches and need to understand them inside out.',
  'Ni+Fi': 'You have a deep inner vision guided by what feels truly right.',
  'Ne+Ti': 'Your mind fires in every direction and you love dissecting how things work.',
  'Ne+Fi': 'You see possibilities everywhere and each one passes through your personal filter of what matters.',
  'Ne+Te': 'You brainstorm like crazy and then execute — ideas meet action.',
  'Ne+Fe': 'You see the best in everyone and connect ideas to bring people together.',
  'Si+Te': 'You remember what works and get it done the right way every time.',
  'Si+Fe': 'You care deeply about tradition, people, and making sure everyone is looked after.',
  'Si+Ti': 'You store detailed knowledge and analyze it with precision — the quiet expert.',
  'Si+Fi': 'You hold onto meaningful memories and live by a strong personal code.',
  'Se+Ti': 'You react fast and think sharp — in the moment with razor-focus.',
  'Se+Fi': 'You live fully in the present and stay anchored to what feels real and authentic.',
  'Se+Te': 'You take action, get results, and deal with reality as it comes.',
  'Se+Fe': 'You read a room instantly and bring energy wherever you go.',
};

function getTeaser(top1: CognitiveFunction, top2: CognitiveFunction): string {
  return COMBO_TEASERS[`${top1}+${top2}`]
    || COMBO_TEASERS[`${top2}+${top1}`]
    || `Your brain leads with ${FUNCTION_LABELS[top1]} and ${FUNCTION_LABELS[top2]} — an interesting combo.`;
}

export function MidQuizCheckIn({ normalizedScores, totalAnswered, totalQuestions, onContinue }: MidQuizCheckInProps) {
  const [revealStep, setRevealStep] = useState(0);

  // Auto-advance the reveal steps for dramatic effect
  useEffect(() => {
    const timers = [
      setTimeout(() => setRevealStep(1), 400),   // show "halfway"
      setTimeout(() => setRevealStep(2), 1200),   // show top function
      setTimeout(() => setRevealStep(3), 2200),   // show teaser
      setTimeout(() => setRevealStep(4), 3200),   // show continue
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const top1 = normalizedScores.rankings[0];
  const top2 = normalizedScores.rankings[1];
  const top1Score = Math.round(normalizedScores.globalNormalized[top1]);
  const top2Score = Math.round(normalizedScores.globalNormalized[top2]);
  const teaser = getTeaser(top1, top2);

  // Get the emerging best-guess type
  const matches = matchToStacks(normalizedScores);
  const bestGuess = matches[0];
  const runnerUp = matches[1];
  const margin = bestGuess.fitScore - runnerUp.fitScore;
  const isClose = margin < 10;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg text-center">

        {/* Celebration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={revealStep >= 1 ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-5xl mb-3">&#x1F9E0;</div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Halfway there
          </h2>
          <p className="text-muted mt-2 text-base">
            {totalAnswered} of {totalQuestions} questions down
          </p>
        </motion.div>

        {/* Top functions reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={revealStep >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-10"
        >
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4">
            Your strongest signals so far
          </p>
          <div className="flex justify-center gap-4">
            {/* Top function 1 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={revealStep >= 2 ? { scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="glass rounded-2xl p-5 flex-1 max-w-[180px]"
            >
              <div
                className="text-3xl font-bold font-mono"
                style={{ color: FUNCTION_COLORS[top1] }}
              >
                {top1}
              </div>
              <div className="text-sm text-muted mt-1">{FUNCTION_LABELS[top1]}</div>
              <motion.div
                className="text-lg font-bold text-foreground mt-2"
                initial={{ opacity: 0 }}
                animate={revealStep >= 2 ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 }}
              >
                {top1Score}%
              </motion.div>
            </motion.div>

            {/* Top function 2 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={revealStep >= 2 ? { scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
              className="glass rounded-2xl p-5 flex-1 max-w-[180px]"
            >
              <div
                className="text-3xl font-bold font-mono"
                style={{ color: FUNCTION_COLORS[top2] }}
              >
                {top2}
              </div>
              <div className="text-sm text-muted mt-1">{FUNCTION_LABELS[top2]}</div>
              <motion.div
                className="text-lg font-bold text-foreground mt-2"
                initial={{ opacity: 0 }}
                animate={revealStep >= 2 ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 }}
              >
                {top2Score}%
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Personality teaser */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={revealStep >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
          <p className="text-base md:text-lg text-foreground/90 leading-relaxed max-w-md mx-auto">
            &ldquo;{teaser}&rdquo;
          </p>
          {isClose ? (
            <p className="text-sm text-accent mt-3">
              It&apos;s a close race between a few types — the next questions will sort it out.
            </p>
          ) : (
            <p className="text-sm text-accent mt-3">
              A pattern is forming. The next 20 questions will sharpen it.
            </p>
          )}
        </motion.div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={revealStep >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mt-10"
        >
          <Button variant="primary" size="lg" onClick={onContinue}>
            Keep Going
          </Button>
          <p className="text-xs text-muted mt-3">
            The deeper questions are next — this is where it gets interesting
          </p>
        </motion.div>
      </div>
    </main>
  );
}
