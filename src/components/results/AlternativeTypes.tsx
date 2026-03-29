'use client';

import { motion } from 'motion/react';
import type { StackMatch } from '@/types/stacks';
import { FUNCTION_COLORS } from '@/lib/constants';

interface AlternativeTypesProps {
  alternatives: StackMatch[];
}

export function AlternativeTypes({ alternatives }: AlternativeTypesProps) {
  if (alternatives.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-1">
        You could also be...
      </h3>
      <p className="text-xs text-muted mb-5">Other types that closely match your answers</p>
      <div className="space-y-2">
        {alternatives.map((alt, i) => (
          <motion.div
            key={alt.type}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + i * 0.05 }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-surface/40 border border-transparent hover:border-border transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-foreground tracking-tight w-10">{alt.type}</span>
              <div className="flex gap-1">
                {[alt.stack.dominant, alt.stack.auxiliary].map((fn) => (
                  <span
                    key={fn}
                    className="text-xs px-1.5 py-0.5 rounded-md font-mono text-white"
                    style={{
                      backgroundColor: FUNCTION_COLORS[fn],
                      boxShadow: `0 2px 8px ${FUNCTION_COLORS[fn]}30`,
                    }}
                  >
                    {fn}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mini probability bar */}
              <div className="w-16 h-1 rounded-full bg-surface overflow-hidden hidden sm:block">
                <motion.div
                  className="h-full rounded-full bg-accent/50"
                  initial={{ width: 0 }}
                  animate={{ width: `${alt.probability * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                />
              </div>
              <span className="text-sm font-mono text-muted tabular-nums w-12 text-right">
                {(alt.probability * 100).toFixed(1)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
