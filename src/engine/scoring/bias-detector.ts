import type { Answer, Question } from '@/types/questions';
import type { UserContext } from '@/types/context';
import type { NormalizedScores, BiasIndicator } from '@/types/scoring';
import type { CognitiveFunction } from '@/types/cognitive-functions';

/**
 * Detect potential biases in the user's answers:
 * 1. Self-image bias: answering as who they want to be, not who they are
 * 2. Environment pressure: structured environments inflating Te/Si scores
 * 3. Social desirability: over-indexing on "cool" functions (Ni, Ti)
 */

// Functions that are commonly over-reported due to social desirability
const DESIRABLE_FUNCTIONS: CognitiveFunction[] = ['Ni', 'Ti', 'Ne'];
const DESIRABILITY_THRESHOLD = 75; // Score above this triggers flag

// Environment-function associations
const STRUCTURED_ENV_FUNCTIONS: CognitiveFunction[] = ['Te', 'Si'];
const FLEXIBLE_ENV_FUNCTIONS: CognitiveFunction[] = ['Ne', 'Se'];

export function detectBias(
  answers: Answer[],
  questions: Question[],
  normalizedScores: NormalizedScores,
  context: UserContext | null
): BiasIndicator[] {
  const indicators: BiasIndicator[] = [];

  // 1. Social desirability bias
  // If user has prior MBTI experience AND scores very high on "desirable" functions
  if (context?.previousMBTIExperience) {
    const highDesirable = DESIRABLE_FUNCTIONS.filter(
      fn => normalizedScores.globalNormalized[fn] >= DESIRABILITY_THRESHOLD
    );

    if (highDesirable.length >= 2) {
      indicators.push({
        type: 'social-desirability',
        description:
          'Since you already know about MBTI, you might have picked answers that match the type you think you are (or want to be) instead of how you actually act day to day.',
        affectedFunctions: highDesirable,
        magnitude: 0.4 + (highDesirable.length - 2) * 0.15,
      });
    }
  }

  // 2. Environment pressure bias
  if (context) {
    if (context.dailyStructure === 'structured') {
      const inflatedStructured = STRUCTURED_ENV_FUNCTIONS.filter(
        fn => normalizedScores.globalNormalized[fn] >= 65
      );

      if (inflatedStructured.length > 0) {
        // Check if default-vs-forced questions tell a different story
        const defaultQs = questions.filter(q => q.isDefaultVsForced);
        const defaultAnswers = answers.filter(a =>
          defaultQs.some(q => q.id === a.questionId)
        );

        // If they have default-vs-forced answers that contradict, flag it
        if (defaultAnswers.length >= 2) {
          indicators.push({
            type: 'environment-pressure',
            description:
              `You live or work in a pretty structured setting, which might be boosting your ${inflatedStructured.join('/')} scores. The way you act at work might not be the same as the "real you" at home.`,
            affectedFunctions: inflatedStructured,
            magnitude: 0.3,
          });
        }
      }
    }

    if (context.dailyStructure === 'flexible') {
      const inflatedFlexible = FLEXIBLE_ENV_FUNCTIONS.filter(
        fn => normalizedScores.globalNormalized[fn] >= 65
      );

      if (inflatedFlexible.length > 0) {
        indicators.push({
          type: 'environment-pressure',
          description:
            `Your free and flexible lifestyle might be boosting your ${inflatedFlexible.join('/')} scores. You might act differently if you had a more structured routine.`,
          affectedFunctions: inflatedFlexible,
          magnitude: 0.25,
        });
      }
    }
  }

  // 3. Work environment type bias
  if (context?.workEnvironment && context.workEnvironment !== 'na') {
    const envMap: Record<string, { functions: CognitiveFunction[]; label: string }> = {
      corporate: { functions: ['Te', 'Fe'], label: 'corporate' },
      startup: { functions: ['Ne', 'Te'], label: 'startup' },
      creative: { functions: ['Fi', 'Ne'], label: 'creative' },
      service: { functions: ['Fe', 'Se'], label: 'service/caregiving' },
      technical: { functions: ['Ti', 'Si'], label: 'technical' },
    };
    const env = envMap[context.workEnvironment];
    if (env) {
      const inflated = env.functions.filter(
        fn => normalizedScores.globalNormalized[fn] >= 65
      );
      if (inflated.length > 0) {
        indicators.push({
          type: 'environment-pressure',
          description: `Your ${env.label} work environment may be boosting your ${inflated.join('/')} scores. Think about how you'd act in a completely different setting.`,
          affectedFunctions: inflated,
          magnitude: 0.3,
        });
      }
    }
  }

  // 4. Living situation bias
  if (context?.livingSituation === 'alone') {
    const inflated: CognitiveFunction[] = (['Fi', 'Ti'] as CognitiveFunction[]).filter(
      fn => normalizedScores.globalNormalized[fn] >= 70
    );
    if (inflated.length > 0) {
      indicators.push({
        type: 'environment-pressure',
        description: `Living alone can reinforce introverted patterns. Your high ${inflated.join('/')} scores might partly reflect your living situation rather than pure preference.`,
        affectedFunctions: inflated,
        magnitude: 0.2,
      });
    }
  }

  // 5. Stress state bias
  if (context?.stressLevel === 'high') {
    indicators.push({
      type: 'stress-state',
      description: 'You said you\'re under a lot of stress right now. That can temporarily shift your answers — especially the stress-related ones — away from your normal patterns.',
      affectedFunctions: [],
      magnitude: 0.5,
    });
  }

  // 6. Self-image bias — detect if all introverted or all extraverted functions are high
  const introFns: CognitiveFunction[] = ['Ti', 'Fi', 'Ni', 'Si'];
  const extroFns: CognitiveFunction[] = ['Te', 'Fe', 'Ne', 'Se'];

  const introAvg =
    introFns.reduce((s, fn) => s + normalizedScores.globalNormalized[fn], 0) / 4;
  const extroAvg =
    extroFns.reduce((s, fn) => s + normalizedScores.globalNormalized[fn], 0) / 4;

  const attitudeSkew = Math.abs(introAvg - extroAvg);
  if (attitudeSkew > 30) {
    const skewedToward = introAvg > extroAvg ? 'introverted' : 'extraverted';
    indicators.push({
      type: 'self-image',
      description:
        `Almost all your answers lean ${skewedToward}. That could be genuinely you, but sometimes people answer based on whether they see themselves as an introvert or extrovert, rather than how they actually handle each situation.`,
      affectedFunctions: skewedToward === 'introverted' ? introFns : extroFns,
      magnitude: Math.min(0.7, attitudeSkew / 50),
    });
  }

  return indicators;
}
