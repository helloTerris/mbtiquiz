'use client';

import { motion } from 'motion/react';
import type { ConfidenceMetrics } from '@/types/scoring';

interface ConfidenceMeterProps {
  confidence: ConfidenceMetrics;
}

export function ConfidenceMeter({ confidence }: ConfidenceMeterProps) {
  const level =
    confidence.overall >= 75
      ? { label: 'High', color: '#34d399', bg: 'rgba(52, 211, 153, 0.08)' }
      : confidence.overall >= 50
        ? { label: 'Moderate', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.08)' }
        : { label: 'Low', color: '#f87171', bg: 'rgba(248, 113, 113, 0.08)' };

  const factors = [
    { label: 'Clear winner', value: Math.min(100, confidence.marginOfVictory * 5), hint: 'How far ahead the top type is' },
    { label: 'Consistency', value: confidence.consistency, hint: 'Similar questions got similar answers' },
    { label: 'Decisiveness', value: confidence.polarization, hint: 'Strong preferences between opposites' },
  ];

  const circumference = 2 * Math.PI * 42;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-1">
        How sure are we?
      </h3>
      <p className="text-xs text-muted mb-6">Higher means your answers pointed clearly to one type</p>

      {/* Circular meter — larger, more dramatic */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="var(--surface)"
              strokeWidth="5"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={level.color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${(confidence.overall / 100) * circumference} ${circumference}`}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${(confidence.overall / 100) * circumference} ${circumference}` }}
              transition={{ delay: 0.3, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                filter: `drop-shadow(0 0 6px ${level.color}40)`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold font-mono"
              style={{ color: level.color }}
            >
              {confidence.overall}
            </motion.span>
          </div>
        </div>

        <p className="font-medium text-foreground text-sm">{level.label} Confidence</p>

        <div className="flex flex-col items-center gap-0.5 mt-1">
          <p className="text-sm text-muted">
            {confidence.contradictionCount > 0
              ? `${confidence.contradictionCount} contradiction${confidence.contradictionCount > 1 ? 's' : ''} detected`
              : 'No contradictions'}
          </p>
          {confidence.ambiguousPairs.length > 0 && (
            <p className="text-sm text-muted">
              Close calls: {confidence.ambiguousPairs.map(([a, b]) => `${a} vs ${b}`).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Factor bars */}
      <div className="space-y-3">
        {factors.map((factor, i) => (
          <div key={factor.label}>
            <div className="flex justify-between text-sm mb-1">
              <div>
                <span className="text-muted">{factor.label}</span>
                <span className="text-xs text-muted/60 ml-1.5 hidden sm:inline">— {factor.hint}</span>
              </div>
              <span className="text-muted font-mono tabular-nums">{Math.round(factor.value)}%</span>
            </div>
            <div className="h-1 rounded-full bg-surface overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
                initial={{ width: 0 }}
                animate={{ width: `${factor.value}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
