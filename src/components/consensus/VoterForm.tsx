'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { createEmptyScores } from '@/types/cognitive-functions';
import type { ConsensusVote } from '@/types/consensus';
import { CORE_QUESTIONS } from '@/engine/questions/question-bank';
import type { Answer, Question } from '@/types/questions';

interface VoterFormProps {
  subjectName: string;
  onSubmit: (vote: ConsensusVote) => void;
}

// Use a subset of the core questions for voter brevity (~15 questions)
function getVoterQuestions(): Question[] {
  // Pick 15 representative questions: 3-4 per axis
  const selectedIds = [
    'c1-01', 'c1-02', 'c1-03', 'c1-04',   // Core axes
    'c1-09', 'c1-10',                        // Ni/Ne default, Fi/Fe inner
    'c2-03', 'c2-04',                        // Scenario Fi/Fe, Ni/Si
    'c2-08', 'c2-09',                        // Ni/Ne work, Si/Se work
    'c3-05', 'c3-06',                        // Ni/Ne decision, Si/Se decision
    'c4-01', 'c4-02', 'c4-09',              // Ti/Fi, Te/Fe, Ni/Se
  ];
  return CORE_QUESTIONS.filter(q => selectedIds.includes(q.id));
}

export function VoterForm({ subjectName, onSubmit }: VoterFormProps) {
  const [voterName, setVoterName] = useState('');
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const startTime = useRef(Date.now());

  const questions = useMemo(() => getVoterQuestions(), []);
  const currentQuestion = questions[currentIndex];

  const handleSelect = useCallback((optionId: string) => {
    if (selected) return;
    setSelected(optionId);

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      timestamp: Date.now(),
      responseTimeMs: Date.now() - startTime.current,
      intensity: 2, // consensus voters observe behavior, default to moderate
    };

    setTimeout(() => {
      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      setSelected(null);
      startTime.current = Date.now();

      if (currentIndex >= questions.length - 1) {
        // Calculate scores from answers
        const scores = createEmptyScores();
        for (const ans of newAnswers) {
          const q = questions.find(qq => qq.id === ans.questionId);
          if (!q) continue;
          const opt = q.options.find(o => o.id === ans.selectedOptionId);
          if (!opt) continue;
          for (const [fn, weight] of Object.entries(opt.functionWeights)) {
            scores[fn as CognitiveFunction] += (weight as number) * q.weight;
          }
        }

        // Normalize to 0-100
        const maxScore = Math.max(...Object.values(scores), 1);
        const normalized = createEmptyScores();
        for (const fn of Object.keys(scores) as CognitiveFunction[]) {
          normalized[fn] = (scores[fn] / maxScore) * 100;
        }

        onSubmit({
          voterId: Math.random().toString(36).substring(2, 8),
          voterName,
          scores: normalized,
          completedAt: Date.now(),
        });
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, 350);
  }, [selected, currentQuestion, answers, currentIndex, questions, onSubmit, voterName]);

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto text-center"
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Type {subjectName}
        </h2>
        <p className="text-base text-muted mb-6">
          Answer these questions about <strong>{subjectName}</strong> based on how you observe them. There are {questions.length} questions.
        </p>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Your name"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all duration-200"
          />
        </div>

        <Button
          variant="primary"
          onClick={() => setStarted(true)}
          disabled={!voterName.trim()}
        >
          Start Typing {subjectName}
        </Button>
      </motion.div>
    );
  }

  if (!currentQuestion) return null;

  // Rewrite question text to be about the subject
  const adaptedText = currentQuestion.text
    .replace(/\byou\b/gi, subjectName)
    .replace(/\byour\b/gi, `${subjectName}'s`)
    .replace(/\byourself\b/gi, subjectName);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-sm text-muted mb-4 font-mono">
        {currentIndex + 1} / {questions.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-medium text-foreground mb-6 leading-relaxed">
            {adaptedText}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const adaptedOption = option.text
                .replace(/\byou\b/gi, subjectName)
                .replace(/\byour\b/gi, `${subjectName}'s`)
                .replace(/\byourself\b/gi, subjectName);

              const isSelected = selected === option.id;
              const isOther = selected !== null && !isSelected;

              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  whileHover={!selected ? { scale: 1.008, y: -1 } : {}}
                  whileTap={!selected ? { scale: 0.995 } : {}}
                  animate={
                    isSelected
                      ? { scale: 1.01 }
                      : isOther
                        ? { scale: 0.98, opacity: 0.3 }
                        : { scale: 1, opacity: 1 }
                  }
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={cn(
                    'w-full text-left rounded-2xl p-5 cursor-pointer border transition-all duration-300 backdrop-blur-xl',
                    !selected && 'bg-glass border-glass-border hover:bg-surface-hover hover:border-border-hover',
                    isSelected && 'border-accent-bright/50 bg-accent/[0.08] shadow-[0_0_25px_rgba(124,106,239,0.3),0_0_60px_rgba(124,106,239,0.1),inset_0_1px_0_rgba(255,255,255,0.06)]',
                    isOther && 'border-transparent bg-surface/30',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={cn(
                        'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300',
                        isSelected
                          ? 'border-accent-bright bg-accent text-white shadow-[0_0_16px_rgba(124,106,239,0.4)]'
                          : 'border-border text-muted bg-surface/50'
                      )}
                    >
                      {index === 0 ? 'A' : 'B'}
                    </span>
                    <p className={cn(
                      'text-base leading-relaxed transition-colors duration-300 pt-1',
                      isSelected ? 'text-foreground' : 'text-foreground',
                      isOther && 'text-muted',
                    )}>
                      {adaptedOption}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
