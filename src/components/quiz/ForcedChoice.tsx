'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/cn';
import type { Question, Answer } from '@/types/questions';

interface ForcedChoiceProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: Answer) => void;
  onBack?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const INTENSITY_OPTIONS = [
  { value: 1 as const, label: 'A little' },
  { value: 2 as const, label: 'Pretty much' },
  { value: 3 as const, label: 'Exactly me' },
];

export function ForcedChoice({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  onRefresh,
  isRefreshing,
}: ForcedChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const optionsEndRef = useRef<HTMLDivElement>(null);
  const prevOptionCount = useRef(question.options.length);

  // Scroll to new options when they appear
  useEffect(() => {
    if (question.options.length > prevOptionCount.current) {
      optionsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    prevOptionCount.current = question.options.length;
  }, [question.options.length]);

  const submitAnswer = useCallback(
    (optionId: string, intensity: 1 | 2 | 3) => {
      setSubmitting(true);
      const responseTimeMs = Date.now() - startTime.current;

      setTimeout(() => {
        onAnswer({
          questionId: question.id,
          selectedOptionId: optionId,
          timestamp: Date.now(),
          responseTimeMs,
          intensity,
        });
        setSelected(null);
        setSubmitting(false);
        startTime.current = Date.now();
      }, 350);
    },
    [onAnswer, question.id],
  );

  const handleSelect = (optionId: string) => {
    if (submitting) return;
    if (selected === optionId) {
      setSelected(null);
      return;
    }
    setSelected(optionId);
  };

  const handleIntensity = (e: React.MouseEvent, intensity: 1 | 2 | 3) => {
    e.stopPropagation();
    if (!selected || submitting) return;
    submitAnswer(selected, intensity);
  };

  const handleMoreOptions = () => {
    setSelected(null);
    onRefresh?.();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Question counter + back */}
        <div className="flex items-center gap-3 mb-6">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-mono text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-60">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          ) : (
            <span className="text-sm font-mono text-muted tracking-wider">
              Q{questionNumber}
            </span>
          )}
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm font-mono text-muted">
            {questionNumber} of {totalQuestions}
          </span>
        </div>

        {/* Question text */}
        <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-8 leading-relaxed tracking-[-0.01em]">
          {question.text}
        </h2>

        {/* Choice options */}
        <div className="space-y-4">
          {question.options.map((option, index) => {
            const isSelected = selected === option.id;
            const isOther = selected !== null && !isSelected;
            const showSeparator = index > 0 && index % 2 === 0;

            return (
              <div key={option.id} className={cn('relative', isSelected && 'z-10')}>
                {showSeparator && (
                  <div className="flex items-center gap-3 py-1 mb-4">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-xs text-muted font-mono">or</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                )}
              <motion.div
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(option.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(option.id); } }}
                whileHover={!submitting ? { scale: 1.008, y: -1 } : {}}
                whileTap={!submitting ? { scale: 0.995 } : {}}
                animate={
                  isSelected
                    ? { scale: 1.01, opacity: 1 }
                    : isOther
                      ? { scale: 0.98, opacity: 0.5 }
                      : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={cn(
                  'w-full text-left rounded-2xl p-5 md:p-6 cursor-pointer',
                  'border transition-all duration-300',
                  'backdrop-blur-xl',
                  !selected && [
                    'bg-glass border-glass-border',
                    'hover:border-border-hover hover:bg-surface-hover',
                  ],
                  isSelected && [
                    'border-accent-bright/50 bg-accent/[0.08]',
                    'shadow-[0_0_25px_rgba(124,106,239,0.3),0_0_60px_rgba(124,106,239,0.1),inset_0_1px_0_rgba(255,255,255,0.06)]',
                  ],
                  isOther && 'border-transparent bg-surface/30',
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Letter badge */}
                  <span
                    className={cn(
                      'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold',
                      'border-2 transition-all duration-300',
                      isSelected
                        ? 'border-accent-bright bg-accent text-white shadow-[0_0_16px_rgba(124,106,239,0.4)]'
                        : 'border-border text-muted bg-surface/50',
                      !selected && 'group-hover:border-border-hover',
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>

                  {/* Option text */}
                  <p
                    className={cn(
                      'text-base leading-relaxed transition-colors duration-300 pt-1',
                      isSelected ? 'text-foreground' : 'text-foreground',
                      isOther && 'text-muted',
                    )}
                  >
                    {option.text}
                  </p>
                </div>

                {/* Selected indicator bar */}
                {isSelected && (
                  <motion.div
                    layoutId="selected-bar"
                    className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-accent-bright"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>

              {/* Intensity card — floating below the selected option */}
              <AnimatePresence>
                {isSelected && !submitting && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className={cn(
                      'relative -mt-3 mx-3 rounded-xl p-4',
                      'bg-surface/90 backdrop-blur-xl',
                      'border border-accent-bright/30',
                      'shadow-[0_8px_32px_rgba(124,106,239,0.25),0_2px_8px_rgba(0,0,0,0.3)]',
                    )}
                  >
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <span className="text-xs font-mono text-muted tracking-wider sm:mr-1">
                        How much is this you?
                      </span>
                      <div className="flex gap-2.5 flex-1">
                        {INTENSITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={(e) => handleIntensity(e, opt.value)}
                            className={cn(
                              'flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer',
                              'border border-accent-bright/30 bg-accent/[0.1]',
                              'hover:border-accent-bright/60 hover:bg-accent/[0.2]',
                              'hover:scale-105 active:scale-95',
                              'transition-all duration-150',
                              'text-foreground/80 hover:text-foreground',
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            );
          })}

          {/* Loading skeletons while generating more options */}
          {isRefreshing && (
            <>
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted font-mono">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              {[0, 1].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="w-full rounded-2xl p-5 md:p-6 border border-glass-border bg-glass backdrop-blur-xl overflow-hidden relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.06] border-2 border-white/[0.08]" />
                    <div className="flex-1 space-y-2.5 pt-1">
                      <div className="h-4 bg-white/[0.06] rounded-lg w-full" />
                      <div className="h-4 bg-white/[0.06] rounded-lg w-3/4" />
                    </div>
                  </div>
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
                </div>
              ))}
            </>
          )}

          <div ref={optionsEndRef} />
        </div>

        {/* More options button — below options */}
        {onRefresh && (
          <button
            onClick={handleMoreOptions}
            disabled={isRefreshing || submitting}
            className={cn(
              'w-full mt-6 py-3 px-4 rounded-xl',
              'flex items-center justify-center gap-2',
              'text-sm font-medium text-muted',
              'border border-dashed border-border',
              'hover:border-border-hover hover:text-foreground hover:bg-surface/50',
              'transition-all duration-200 cursor-pointer',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className={cn(isRefreshing && 'animate-spin')}
            >
              <path
                d="M13.65 2.35A7.96 7.96 0 0 0 8 0a8 8 0 1 0 7.74 6h-2.08A6 6 0 1 1 8 2c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z"
                fill="currentColor"
              />
            </svg>
            {isRefreshing ? 'Generating more options...' : 'Generate more options'}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
