'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { UserContext, LifeStage, WorkEnvironment, LivingSituation, StressLevel, UpbringingStyle } from '@/types/context';

interface ContextFormProps {
  onSubmit: (context: UserContext) => void;
}

type Step = 'lifeStage' | 'workEnv' | 'structure' | 'socialAndLiving' | 'upbringingAndStress' | 'mbtiExp';

// Life stages that have a work environment
const WORKING_STAGES: LifeStage[] = ['student', 'early-career', 'mid-career', 'freelance'];

const LIFE_STAGES: { value: LifeStage; label: string; desc: string; icon: string }[] = [
  { value: 'student', label: 'Student', desc: 'Currently studying', icon: '\u{1F393}' },
  { value: 'early-career', label: 'Early Career', desc: 'First few years working', icon: '\u{1F680}' },
  { value: 'mid-career', label: 'Mid Career', desc: 'Established in your field', icon: '\u{1F3AF}' },
  { value: 'freelance', label: 'Freelance / Self-Employed', desc: 'You run your own work', icon: '\u{1F4BC}' },
  { value: 'caregiver', label: 'Caregiver / Stay-at-Home', desc: 'Primary focus is caring for others', icon: '\u{1F49C}' },
  { value: 'retired', label: 'Retired', desc: 'No longer working', icon: '\u{1F305}' },
  { value: 'between-jobs', label: 'Between Jobs', desc: 'Currently in transition', icon: '\u{1F504}' },
  { value: 'other', label: 'Other', desc: 'None of these fit', icon: '\u{2728}' },
];

const WORK_ENVIRONMENTS: { value: WorkEnvironment; label: string; desc: string; icon: string }[] = [
  { value: 'corporate', label: 'Corporate / Office', desc: 'Large org, clear chain of command', icon: '\u{1F3E2}' },
  { value: 'startup', label: 'Startup / Small Team', desc: 'Fast-paced, wearing many hats', icon: '\u{26A1}' },
  { value: 'creative', label: 'Creative / Artistic', desc: 'Design, writing, art, music', icon: '\u{1F3A8}' },
  { value: 'service', label: 'Service / Caregiving', desc: 'Healthcare, education, social work', icon: '\u{1F91D}' },
  { value: 'technical', label: 'Technical / Analytical', desc: 'Engineering, science, data', icon: '\u{1F52C}' },
];

const STRUCTURES = [
  { value: 'structured' as const, label: 'Structured', desc: 'Fixed schedule, clear rules', icon: '\u{1F4CB}' },
  { value: 'flexible' as const, label: 'Flexible', desc: 'You set your own pace', icon: '\u{1F30A}' },
  { value: 'mixed' as const, label: 'Mixed', desc: 'Varies day to day', icon: '\u{1F504}' },
];

const SOCIAL_LEVELS = [
  { value: 'low' as const, label: 'Low', desc: 'Mostly alone or small groups', icon: '\u{1F9D8}' },
  { value: 'medium' as const, label: 'Medium', desc: 'Regular social interaction', icon: '\u{1F91D}' },
  { value: 'high' as const, label: 'High', desc: 'Constantly around people', icon: '\u{1F389}' },
];

const LIVING_SITUATIONS: { value: LivingSituation; label: string; desc: string; icon: string }[] = [
  { value: 'alone', label: 'Live Alone', desc: 'Just you', icon: '\u{1F3E0}' },
  { value: 'partner-family', label: 'Partner or Family', desc: 'With a partner, spouse, or family', icon: '\u{1F46A}' },
  { value: 'roommates', label: 'Roommates', desc: 'Shared living with non-family', icon: '\u{1F465}' },
];

const UPBRINGING_STYLES: { value: UpbringingStyle; label: string; desc: string; icon: string }[] = [
  { value: 'be-tough', label: 'Be Tough', desc: 'Stay strong, be logical, don\'t show weakness', icon: '\u{1F6E1}' },
  { value: 'be-kind', label: 'Be Kind', desc: 'Think of others, keep the peace, be caring', icon: '\u{1F49B}' },
  { value: 'balanced', label: 'Balanced', desc: 'A mix of both, or neither stood out', icon: '\u{2696}' },
];

const STRESS_LEVELS: { value: StressLevel; label: string; desc: string; icon: string }[] = [
  { value: 'low', label: 'Low', desc: 'Life feels manageable and calm', icon: '\u{1F33F}' },
  { value: 'moderate', label: 'Moderate', desc: 'Some pressure but handling it', icon: '\u{1F60C}' },
  { value: 'high', label: 'High', desc: 'Significant stress right now', icon: '\u{1F525}' },
];

function RadioOption({
  selected,
  label,
  desc,
  icon,
  onClick,
}: {
  selected: boolean;
  label: string;
  desc: string;
  icon?: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={!selected ? { scale: 1.008, y: -1 } : {}}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      animate={selected ? { scale: 1.01 } : { scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'w-full text-left rounded-2xl p-4 md:p-5 cursor-pointer',
        'border-2 transition-all duration-300',
        'backdrop-blur-xl',
        selected
          ? [
              'border-accent-bright/50 bg-accent/[0.08]',
              'shadow-[0_0_25px_rgba(124,106,239,0.3),0_0_60px_rgba(124,106,239,0.1),inset_0_1px_0_rgba(255,255,255,0.06)]',
            ]
          : [
              'border-transparent bg-glass',
              'hover:border-border-hover hover:bg-surface-hover',
            ]
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center',
            selected
              ? 'border-accent-bright bg-accent shadow-[0_0_12px_rgba(124,106,239,0.5)]'
              : 'border-muted bg-transparent',
          )}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="w-2 h-2 rounded-full bg-white"
            />
          )}
        </div>
        {icon && <span className="text-lg">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-base text-foreground">{label}</p>
          <p className="text-sm mt-0.5 text-muted">{desc}</p>
        </div>
      </div>
    </motion.button>
  );
}

export function ContextForm({ onSubmit }: ContextFormProps) {
  const [step, setStep] = useState<Step>('lifeStage');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null);
  const [workEnv, setWorkEnv] = useState<WorkEnvironment | null>(null);
  const [structure, setStructure] = useState<'structured' | 'flexible' | 'mixed' | null>(null);
  const [social, setSocial] = useState<'low' | 'medium' | 'high' | null>(null);
  const [livingSituation, setLivingSituation] = useState<LivingSituation | null>(null);
  const [upbringing, setUpbringing] = useState<UpbringingStyle | null>(null);
  const [stressLevel, setStressLevel] = useState<StressLevel | null>(null);
  const [mbtiExp, setMbtiExp] = useState<boolean | null>(null);

  // Dynamic steps: skip workEnv if life stage doesn't have a work environment
  const steps = useMemo<Step[]>(() => {
    const base: Step[] = ['lifeStage'];
    if (lifeStage && WORKING_STAGES.includes(lifeStage)) {
      base.push('workEnv');
    }
    base.push('structure', 'socialAndLiving', 'upbringingAndStress', 'mbtiExp');
    return base;
  }, [lifeStage]);

  const currentIndex = steps.indexOf(step);

  const goToStep = (targetIndex: number) => {
    if (targetIndex === currentIndex) return;
    setDirection(targetIndex > currentIndex ? 1 : -1);
    setStep(steps[targetIndex]);
  };

  const canProceed = () => {
    switch (step) {
      case 'lifeStage': return lifeStage !== null;
      case 'workEnv': return workEnv !== null;
      case 'structure': return structure !== null;
      case 'socialAndLiving': return social !== null && livingSituation !== null;
      case 'upbringingAndStress': return upbringing !== null && stressLevel !== null;
      case 'mbtiExp': return mbtiExp !== null;
    }
  };

  const handleNext = () => {
    if (step === 'mbtiExp' && lifeStage && structure && social && livingSituation && upbringing && stressLevel && mbtiExp !== null) {
      onSubmit({
        lifeStage,
        workEnvironment: workEnv ?? 'na',
        dailyStructure: structure,
        socialExposure: social,
        livingSituation,
        stressLevel,
        upbringing,
        previousMBTIExperience: mbtiExp,
        isTypingOther: false,
      });
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      // When changing life stage, reset workEnv if no longer applicable
      if (step === 'lifeStage' && lifeStage && !WORKING_STAGES.includes(lifeStage)) {
        setWorkEnv(null);
      }
      setDirection(1);
      setStep(steps[nextIndex]);
    }
  };

  const stepTitles: Record<Step, string> = {
    lifeStage: 'What best describes your current situation?',
    workEnv: 'What kind of environment do you work in?',
    structure: 'How structured is your daily life?',
    socialAndLiving: 'Your social life and living situation',
    upbringingAndStress: 'Your background and current state',
    mbtiExp: 'Have you explored MBTI or cognitive functions before?',
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const canClick = isCompleted;

          return (
            <div key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => canClick && goToStep(i)}
                disabled={!canClick}
                className={cn(
                  'rounded-full transition-all duration-300',
                  isCurrent
                    ? 'w-3 h-3 bg-accent-bright shadow-[0_0_8px_rgba(124,106,239,0.5)]'
                    : isCompleted
                      ? 'w-2.5 h-2.5 bg-accent cursor-pointer hover:bg-accent-bright hover:shadow-[0_0_6px_rgba(124,106,239,0.4)]'
                      : 'w-2 h-2 bg-muted cursor-default',
                )}
              />
              {i < steps.length - 1 && (
                <div className={cn(
                  'w-8 h-px transition-colors duration-300',
                  isCompleted ? 'bg-accent/50' : 'bg-border',
                )} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-6 tracking-[-0.01em]">
            {stepTitles[step]}
          </h2>

          <div className="space-y-3">
            {step === 'lifeStage' &&
              LIFE_STAGES.map((s) => (
                <RadioOption
                  key={s.value}
                  selected={lifeStage === s.value}
                  label={s.label}
                  desc={s.desc}
                  icon={s.icon}
                  onClick={() => setLifeStage(s.value)}
                />
              ))}

            {step === 'workEnv' &&
              WORK_ENVIRONMENTS.map((s) => (
                <RadioOption
                  key={s.value}
                  selected={workEnv === s.value}
                  label={s.label}
                  desc={s.desc}
                  icon={s.icon}
                  onClick={() => setWorkEnv(s.value)}
                />
              ))}

            {step === 'structure' &&
              STRUCTURES.map((s) => (
                <RadioOption
                  key={s.value}
                  selected={structure === s.value}
                  label={s.label}
                  desc={s.desc}
                  icon={s.icon}
                  onClick={() => setStructure(s.value)}
                />
              ))}

            {step === 'socialAndLiving' && (
              <>
                <p className="text-sm font-mono text-muted uppercase tracking-wider mb-2">Social interaction</p>
                {SOCIAL_LEVELS.map((s) => (
                  <RadioOption
                    key={s.value}
                    selected={social === s.value}
                    label={s.label}
                    desc={s.desc}
                    icon={s.icon}
                    onClick={() => setSocial(s.value)}
                  />
                ))}
                <div className="border-t border-border my-4" />
                <p className="text-sm font-mono text-muted uppercase tracking-wider mb-2">Living situation</p>
                {LIVING_SITUATIONS.map((s) => (
                  <RadioOption
                    key={s.value}
                    selected={livingSituation === s.value}
                    label={s.label}
                    desc={s.desc}
                    icon={s.icon}
                    onClick={() => setLivingSituation(s.value)}
                  />
                ))}
              </>
            )}

            {step === 'upbringingAndStress' && (
              <>
                <p className="text-sm font-mono text-muted uppercase tracking-wider mb-2">Growing up, the message you got most was</p>
                {UPBRINGING_STYLES.map((s) => (
                  <RadioOption
                    key={s.value}
                    selected={upbringing === s.value}
                    label={s.label}
                    desc={s.desc}
                    icon={s.icon}
                    onClick={() => setUpbringing(s.value)}
                  />
                ))}
                <div className="border-t border-border my-4" />
                <p className="text-sm font-mono text-muted uppercase tracking-wider mb-2">How stressed are you right now?</p>
                {STRESS_LEVELS.map((s) => (
                  <RadioOption
                    key={s.value}
                    selected={stressLevel === s.value}
                    label={s.label}
                    desc={s.desc}
                    icon={s.icon}
                    onClick={() => setStressLevel(s.value)}
                  />
                ))}
              </>
            )}

            {step === 'mbtiExp' && (
              <>
                <RadioOption
                  selected={mbtiExp === true}
                  label="Yes"
                  desc="I have some familiarity with MBTI or cognitive functions"
                  icon={'\u{1F4DA}'}
                  onClick={() => setMbtiExp(true)}
                />
                <RadioOption
                  selected={mbtiExp === false}
                  label="No"
                  desc="This is my first time"
                  icon={'\u{1F331}'}
                  onClick={() => setMbtiExp(false)}
                />
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex justify-between items-center">
        {currentIndex > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToStep(currentIndex - 1)}
          >
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {step === 'mbtiExp' ? 'Start Test' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
