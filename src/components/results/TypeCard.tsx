'use client';

import { motion } from 'motion/react';
import type { StackMatch } from '@/types/stacks';
import { FUNCTION_COLORS } from '@/lib/constants';

interface TypeCardProps {
  match: StackMatch;
  confidence: number;
}

export function TypeCard({ match, confidence }: TypeCardProps) {
  const { stack } = match;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative glass rounded-3xl p-10 md:p-12 text-center overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/[0.08] blur-[80px]" />
      </div>

      <div className="relative">
        {/* Type label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-mono text-muted uppercase tracking-[0.2em] mb-4"
        >
          Your personality type
        </motion.div>

        {/* Type */}
        <motion.h1
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-7xl md:text-8xl font-bold gradient-text mb-3 tracking-[-0.03em]"
        >
          {match.type}
        </motion.h1>

        {/* Confidence */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-sm font-mono text-muted mb-8"
        >
          {Math.round(confidence)}% confidence
        </motion.p>

        {/* Stack visualization */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="flex items-center justify-center gap-2 md:gap-3"
        >
          {(['dominant', 'auxiliary', 'tertiary', 'inferior'] as const).map((pos, i) => {
            const fn = stack[pos];
            return (
              <motion.div
                key={pos}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.08 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-lg border border-white/10"
                  style={{
                    backgroundColor: FUNCTION_COLORS[fn],
                    boxShadow: `0 4px 20px ${FUNCTION_COLORS[fn]}40`,
                  }}
                >
                  {fn}
                </div>
                <span className="text-xs text-muted font-mono uppercase tracking-wider">
                  {pos === 'dominant' ? 'Main' : pos === 'auxiliary' ? 'Support' : pos === 'tertiary' ? 'Relief' : 'Blind spot'}
                </span>
              </motion.div>
            );
          })}

          {/* Arrows between stack items */}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex items-center justify-center gap-6 mt-8 text-sm font-mono text-muted"
        >
          <span>Match strength {Math.round(match.fitScore)}%</span>
          <span className="w-px h-3 bg-border" />
          <span>Likelihood {(match.probability * 100).toFixed(1)}%</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
