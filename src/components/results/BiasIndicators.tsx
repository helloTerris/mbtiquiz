'use client';

import { motion } from 'motion/react';
import type { BiasIndicator } from '@/types/scoring';
import { FUNCTION_COLORS } from '@/lib/constants';

interface BiasIndicatorsProps {
  indicators: BiasIndicator[];
}

const BIAS_ICONS: Record<BiasIndicator['type'], string> = {
  'self-image': '\u{1F6A9}',
  'environment-pressure': '\u{1F3E2}',
  'social-desirability': '\u{2728}',
  'stress-state': '\u{1F525}',
  'upbringing-conditioning': '\u{1F331}',
  'social-exposure-mismatch': '\u{1F504}',
  'life-stage-pressure': '\u{231B}',
};

const BIAS_TITLES: Record<BiasIndicator['type'], string> = {
  'self-image': 'Answering as who you want to be',
  'environment-pressure': 'Shaped by your environment',
  'social-desirability': 'Picking the "cool" answer',
  'stress-state': 'Under stress right now',
  'upbringing-conditioning': 'Shaped by how you were raised',
  'social-exposure-mismatch': 'Social life vs. answers don\'t match',
  'life-stage-pressure': 'Your current life stage may be talking',
};

const MAX_DISPLAYED_INDICATORS = 4;

export function BiasIndicators({ indicators }: BiasIndicatorsProps) {
  if (indicators.length === 0) return null;

  // Show top indicators by magnitude, capped to avoid overwhelming the user
  const sorted = [...indicators].sort((a, b) => b.magnitude - a.magnitude);
  const displayed = sorted.slice(0, MAX_DISPLAYED_INDICATORS);

  return (
    <div className="glass rounded-2xl p-6 border border-violet-500/15">
      <h3 className="text-sm font-mono text-violet-400 uppercase tracking-wider mb-4">
        Things that may have skewed your results
      </h3>
      <p className="text-sm text-muted mb-4">
        Nothing wrong here — just patterns we noticed. Take them with a grain of salt.
      </p>

      <div className="space-y-3">
        {displayed.map((indicator, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-xl bg-surface/50"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{BIAS_ICONS[indicator.type]}</span>
              <span className="text-sm font-medium text-foreground">
                {BIAS_TITLES[indicator.type]}
              </span>
              {/* Magnitude indicator */}
              <div className="ml-auto flex items-center gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        indicator.magnitude >= level * 0.25
                          ? 'var(--accent)'
                          : 'var(--surface)',
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {indicator.description}
            </p>
            <div className="flex gap-1 mt-2">
              {indicator.affectedFunctions.map((fn) => (
                <span
                  key={fn}
                  className="text-xs px-1.5 py-0.5 rounded font-mono text-white"
                  style={{ backgroundColor: FUNCTION_COLORS[fn] }}
                >
                  {fn}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
