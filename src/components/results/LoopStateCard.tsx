'use client';

import { motion } from 'motion/react';
import type { LoopState } from '@/types/results';
import { FUNCTION_COLORS, FUNCTION_LABELS } from '@/lib/constants';

interface LoopStateCardProps {
  loopState: LoopState;
}

const SEVERITY_COLORS = {
  mild: 'text-amber-400 border-amber-500/20',
  moderate: 'text-orange-400 border-orange-500/20',
  strong: 'text-red-400 border-red-500/20',
};

const SEVERITY_LABELS = {
  mild: 'Mild',
  moderate: 'Moderate',
  strong: 'Strong',
};

export function LoopStateCard({ loopState }: LoopStateCardProps) {
  if (!loopState.detected || !loopState.loopFunctions || !loopState.suppressedFunction || !loopState.severity) {
    return null;
  }

  const [dom, tert] = loopState.loopFunctions;
  const aux = loopState.suppressedFunction;
  const severityClass = SEVERITY_COLORS[loopState.severity];
  const domColor = FUNCTION_COLORS[dom];
  const tertColor = FUNCTION_COLORS[tert];

  return (
    <div className={`glass rounded-2xl p-6 border ${severityClass.split(' ')[1]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em]">
          You might be stuck in a loop
        </h3>
        <span className={`text-xs font-mono uppercase tracking-wider ${severityClass.split(' ')[0]}`}>
          {SEVERITY_LABELS[loopState.severity]}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold border border-white/10"
            style={{ backgroundColor: domColor, boxShadow: `0 4px 16px ${domColor}35` }}
          >
            {dom}
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted opacity-50">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold border border-white/10"
            style={{ backgroundColor: tertColor, boxShadow: `0 4px 16px ${tertColor}35` }}
          >
            {tert}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Over-relying on {FUNCTION_LABELS[dom]} + {FUNCTION_LABELS[tert]}
          </p>
          <p className="text-sm text-muted">
            While neglecting your {FUNCTION_LABELS[aux]}
          </p>
        </div>
      </div>

      {loopState.description && (
        <p className="text-base text-muted leading-relaxed mb-4">
          {loopState.description}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-surface/50 rounded-xl p-4 border border-border/50"
      >
        <p className="text-sm text-muted leading-relaxed">
          Two of your thinking styles are teaming up while a third one gets
          ignored. It can feel comfortable, like a well-worn habit, but it means
          you&apos;re seeing things from only one angle. Practicing your{' '}
          <span className="text-foreground font-medium">{FUNCTION_LABELS[aux]}</span>{' '}
          more can help you get unstuck.
        </p>
      </motion.div>
    </div>
  );
}
