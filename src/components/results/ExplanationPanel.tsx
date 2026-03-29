'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { TypeExplanation } from '@/types/results';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { FUNCTION_COLORS, FUNCTION_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface ExplanationPanelProps {
  explanation: TypeExplanation;
  rankings: CognitiveFunction[];
}

export function ExplanationPanel({ explanation, rankings }: ExplanationPanelProps) {
  const [expandedFn, setExpandedFn] = useState<CognitiveFunction | null>(null);

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-5">
        Why this type?
      </h3>

      <p className="text-base text-foreground leading-relaxed mb-4">
        {explanation.summary}
      </p>

      <p className="text-base text-muted leading-relaxed mb-6">
        {explanation.stackExplanation}
      </p>

      {/* Per-function expandable */}
      <div className="space-y-1 mb-5">
        <p className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-2">
          Your top thinking styles
        </p>
        {rankings.slice(0, 4).map((fn) => {
          const isExpanded = expandedFn === fn;
          return (
            <div key={fn}>
              <button
                onClick={() => setExpandedFn(isExpanded ? null : fn)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer',
                  isExpanded
                    ? 'bg-accent/[0.06] border border-accent/20'
                    : 'hover:bg-surface-hover border border-transparent',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-[3px]"
                    style={{
                      backgroundColor: FUNCTION_COLORS[fn],
                      boxShadow: isExpanded ? `0 0 8px ${FUNCTION_COLORS[fn]}40` : 'none',
                    }}
                  />
                  <span className={cn(
                    'text-sm font-semibold transition-colors',
                    isExpanded ? 'text-foreground' : 'text-foreground',
                  )}>{fn}</span>
                  <span className="text-sm text-muted">{FUNCTION_LABELS[fn]}</span>
                </div>
                <motion.span
                  animate={{ rotate: isExpanded ? 45 : 0 }}
                  className="text-sm text-muted"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {isExpanded && explanation.functionExplanations[fn] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-muted px-3 pb-3 pt-1 leading-relaxed">
                      {explanation.functionExplanations[fn]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Caveat */}
      <div className="p-3.5 rounded-xl bg-surface/40 border border-border">
        <p className="text-sm text-muted leading-relaxed">
          {explanation.caveat}
        </p>
      </div>
    </div>
  );
}
