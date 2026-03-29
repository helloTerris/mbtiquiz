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
          'Your prior familiarity with MBTI combined with high scores on commonly idealized functions (Ni, Ti, Ne) may indicate some answers reflect aspiration rather than natural behavior.',
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
              `Your structured daily environment may be inflating your ${inflatedStructured.join('/')} scores. Your "default behavior" answers may better reflect your natural preferences.`,
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
            `Your flexible lifestyle may be inflating your ${inflatedFlexible.join('/')} scores. Consider whether you would still favor these patterns in a more structured setting.`,
          affectedFunctions: inflatedFlexible,
          magnitude: 0.25,
        });
      }
    }
  }

  // 3. Self-image bias — detect if all introverted or all extraverted functions are high
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
        `Your scores skew heavily toward ${skewedToward} functions (${Math.round(attitudeSkew)} point gap). While this can be genuine, extreme skew sometimes reflects self-image rather than actual cognitive preference.`,
      affectedFunctions: skewedToward === 'introverted' ? introFns : extroFns,
      magnitude: Math.min(0.7, attitudeSkew / 50),
    });
  }

  return indicators;
}
