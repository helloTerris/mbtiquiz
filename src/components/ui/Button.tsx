'use client';

import { cn } from '@/lib/cn';
import { motion } from 'motion/react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  onClick,
  disabled,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.015, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl font-medium tracking-[-0.01em]',
        'transition-all duration-250 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        {
          // Primary — glowing accent
          'bg-gradient-to-b from-accent-bright to-accent text-white shadow-[0_2px_20px_rgba(124,106,239,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_30px_rgba(124,106,239,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]':
            variant === 'primary',
          // Secondary — glass with border
          'glass border border-border text-foreground hover:border-border-hover hover:bg-surface-hover':
            variant === 'secondary',
          // Ghost — minimal
          'bg-transparent text-muted hover:text-foreground hover:bg-surface-hover':
            variant === 'ghost',
        },
        {
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-2.5 text-sm': size === 'md',
          'px-8 py-3.5 text-base': size === 'lg',
        },
        className
      )}
    >
      {children}
    </motion.button>
  );
}
