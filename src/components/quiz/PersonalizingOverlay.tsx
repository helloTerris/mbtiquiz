'use client';

import { motion } from 'motion/react';

export function PersonalizingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
      >
        {/* Shimmer bar */}
        <div className="relative h-1.5 w-48 mx-auto rounded-full bg-glass-border overflow-hidden mb-6">
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-accent/0 via-accent-bright to-accent/0"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <h3 className="text-lg font-medium text-foreground mb-2">
          Tailoring questions to your situation...
        </h3>
        <p className="text-sm text-muted">
          This can take up to 20 seconds
        </p>
      </motion.div>
    </motion.div>
  );
}
