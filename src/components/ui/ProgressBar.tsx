'use client';

import { cn } from '@/lib/cn';
import { motion } from 'motion/react';

interface ProgressBarProps {
  value: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  className,
  color,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-muted">{label}</span>}
          <span className="text-sm font-mono text-muted">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: color
              ? color
              : `linear-gradient(90deg, var(--accent) 0%, var(--accent-bright) 100%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Shimmer effect on the leading edge */}
          <div
            className="absolute right-0 top-0 h-full w-8 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2))',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
