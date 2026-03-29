'use client';

import { cn } from '@/lib/cn';
import { motion } from 'motion/react';

interface GlassPanelProps {
  hover?: boolean;
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function GlassPanel({
  hover = false,
  glow = false,
  className,
  children,
  onClick,
}: GlassPanelProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2, scale: 1.005 } : {}}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'glass rounded-2xl p-6 border border-glass-border',
        hover && 'cursor-pointer hover:border-border-hover hover:bg-surface-hover transition-all duration-300',
        glow && 'glow',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
