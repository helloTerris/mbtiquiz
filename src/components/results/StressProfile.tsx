'use client';

import { motion } from 'motion/react';
import type { StressProfile as StressProfileType } from '@/types/results';
import { FUNCTION_COLORS, FUNCTION_LABELS } from '@/lib/constants';

interface StressProfileProps {
  profile: StressProfileType;
}

export function StressProfile({ profile }: StressProfileProps) {
  const color = FUNCTION_COLORS[profile.inferiorFunction];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-1">
        When you&apos;re stressed
      </h3>
      <p className="text-xs text-muted mb-5">How you might act when overwhelmed or burned out</p>

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold border border-white/10"
          style={{
            backgroundColor: color,
            boxShadow: `0 4px 16px ${color}35`,
          }}
        >
          {profile.inferiorFunction}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {FUNCTION_LABELS[profile.inferiorFunction]}
          </p>
          <p className="text-sm text-muted">Your weakest area — it takes over under stress</p>
        </div>
      </div>

      <p className="text-base text-muted mb-5 leading-relaxed">
        {profile.description}
      </p>

      <div className="space-y-2">
        <p className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-2">
          You might find yourself...
        </p>
        {profile.gripBehaviors.map((behavior, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-2.5 py-1"
          >
            <div
              className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-base text-foreground leading-relaxed">{behavior}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
