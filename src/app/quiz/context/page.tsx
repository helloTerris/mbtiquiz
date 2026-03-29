'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ContextForm } from '@/components/quiz/ContextForm';
import { useContextStore } from '@/stores/context-store';
import { useQuizStore } from '@/stores/quiz-store';
import type { UserContext } from '@/types/context';

export default function ContextPage() {
  const router = useRouter();
  const setContext = useContextStore((s) => s.setContext);
  const setPhase = useQuizStore((s) => s.setPhase);

  const handleSubmit = (context: UserContext) => {
    setContext(context);
    setPhase('test');
    router.push('/quiz/test');
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Before we begin
          </h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            A few quick questions about your current situation.
            This helps us adapt the test to your context — it does not affect your type.
          </p>
        </div>

        <ContextForm onSubmit={handleSubmit} />
      </motion.div>
    </main>
  );
}
