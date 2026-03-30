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

// Upbringing conditioning associations
const TOUGH_UPBRINGING_FUNCTIONS: CognitiveFunction[] = ['Te', 'Ti'];
const KIND_UPBRINGING_FUNCTIONS: CognitiveFunction[] = ['Fe', 'Fi'];

// Social exposure mismatch associations
const HIGH_SOCIAL_FUNCTIONS: CognitiveFunction[] = ['Fe', 'Ne'];
const LOW_SOCIAL_FUNCTIONS: CognitiveFunction[] = ['Fi', 'Ti'];

/**
 * Score only the default-vs-forced answers to see which functions
 * the user favors when environmental pressure is stripped away.
 */
function scoreDefaultAnswers(
  answers: Answer[],
  questions: Question[]
): Partial<Record<CognitiveFunction, number>> {
  const defaultQs = questions.filter(q => q.isDefaultVsForced);
  const hits: Partial<Record<CognitiveFunction, number>> = {};

  for (const answer of answers) {
    const q = defaultQs.find(dq => dq.id === answer.questionId);
    if (!q) continue;
    const opt = q.options.find(o => o.id === answer.selectedOptionId);
    if (!opt) continue;
    for (const [fn, w] of Object.entries(opt.functionWeights)) {
      hits[fn as CognitiveFunction] = (hits[fn as CognitiveFunction] || 0) + (w as number);
    }
  }

  return hits;
}

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

  // 2. Environment pressure bias (with default-vs-forced cross-referencing)
  const defaultHits = scoreDefaultAnswers(answers, questions);

  if (context) {
    if (context.dailyStructure === 'structured') {
      const inflatedStructured = STRUCTURED_ENV_FUNCTIONS.filter(
        fn => normalizedScores.globalNormalized[fn] >= 65
      );

      if (inflatedStructured.length > 0) {
        // Cross-reference: do default-vs-forced answers contradict?
        const defaultContradict = inflatedStructured.some(fn => (defaultHits[fn] || 0) < 2);
        const magnitude = defaultContradict ? 0.5 : 0.3;

        indicators.push({
          type: 'environment-pressure',
          description: defaultContradict
            ? `Your structured environment seems to be significantly boosting your ${inflatedStructured.join('/')} scores. When we looked at your "no-pressure" answers, they tell a different story — the real you might not lean on these as much.`
            : `You live or work in a pretty structured setting, which might be boosting your ${inflatedStructured.join('/')} scores. The way you act at work might not be the same as the "real you" at home.`,
          affectedFunctions: inflatedStructured,
          magnitude,
        });
      }
    }

    if (context.dailyStructure === 'flexible') {
      const inflatedFlexible = FLEXIBLE_ENV_FUNCTIONS.filter(
        fn => normalizedScores.globalNormalized[fn] >= 65
      );

      if (inflatedFlexible.length > 0) {
        const defaultContradict = inflatedFlexible.some(fn => (defaultHits[fn] || 0) < 2);
        const magnitude = defaultContradict ? 0.45 : 0.25;

        indicators.push({
          type: 'environment-pressure',
          description: defaultContradict
            ? `Your flexible lifestyle seems to be significantly boosting your ${inflatedFlexible.join('/')} scores. Your "no-pressure" answers suggest you might not actually prefer these as much as your daily habits show.`
            : `Your free and flexible lifestyle might be boosting your ${inflatedFlexible.join('/')} scores. You might act differently if you had a more structured routine.`,
          affectedFunctions: inflatedFlexible,
          magnitude,
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

  // 7. Upbringing conditioning bias
  if (context?.upbringing && context.upbringing !== 'balanced') {
    const targetFns = context.upbringing === 'be-tough'
      ? TOUGH_UPBRINGING_FUNCTIONS
      : KIND_UPBRINGING_FUNCTIONS;
    const label = context.upbringing === 'be-tough' ? 'logic and toughness' : 'caring and harmony';

    const inflated = targetFns.filter(
      fn => normalizedScores.globalNormalized[fn] >= 65
    );

    if (inflated.length > 0) {
      indicators.push({
        type: 'upbringing-conditioning',
        description:
          `You grew up with a "${context.upbringing === 'be-tough' ? 'be tough' : 'be kind'}" message, and your ${inflated.join('/')} scores are high. That upbringing might have trained you to value ${label} — it could be genuinely you, or it could be conditioning you absorbed growing up.`,
        affectedFunctions: inflated,
        magnitude: 0.3 + (inflated.length - 1) * 0.1,
      });
    }
  }

  // 8. Social exposure mismatch
  if (context?.socialExposure) {
    if (context.socialExposure === 'low') {
      const mismatched = HIGH_SOCIAL_FUNCTIONS.filter(
        fn => normalizedScores.globalNormalized[fn] >= 70
      );
      if (mismatched.length > 0) {
        indicators.push({
          type: 'social-exposure-mismatch',
          description:
            `You said you don't interact with people much, but you scored high on ${mismatched.join('/')}. This could be a genuine natural gift, or it might reflect how you wish you were in social situations rather than how you actually act.`,
          affectedFunctions: mismatched,
          magnitude: 0.35,
        });
      }
    }

    if (context.socialExposure === 'high') {
      const mismatched = LOW_SOCIAL_FUNCTIONS.filter(
        fn => normalizedScores.globalNormalized[fn] >= 70
      );
      if (mismatched.length > 0) {
        indicators.push({
          type: 'social-exposure-mismatch',
          description:
            `You're constantly around people but scored high on ${mismatched.join('/')}. This could be genuinely you (introverts can have very social lives), or your answers might reflect wanting more alone time than you actually get.`,
          affectedFunctions: mismatched,
          magnitude: 0.25,
        });
      }
    }
  }

  // 9. Life stage pressure bias
  if (context?.lifeStage) {
    if (context.lifeStage === 'caregiver') {
      const inflated = (['Fe', 'Si'] as CognitiveFunction[]).filter(
        fn => normalizedScores.globalNormalized[fn] >= 65
      );
      if (inflated.length > 0) {
        indicators.push({
          type: 'life-stage-pressure',
          description:
            `Being a caregiver demands a lot of emotional attunement and routine management. Your high ${inflated.join('/')} scores might reflect what your role requires rather than your natural wiring.`,
          affectedFunctions: inflated,
          magnitude: 0.3,
        });
      }
    }

    if (context.lifeStage === 'student') {
      if (normalizedScores.globalNormalized['Ne'] >= 65) {
        indicators.push({
          type: 'life-stage-pressure',
          description:
            'Being a student means your life is full of new ideas, exploration, and possibilities. Your high idea-exploring score might partly reflect your current environment rather than a lifelong pattern.',
          affectedFunctions: ['Ne'],
          magnitude: 0.25,
        });
      }
    }

    if (context.lifeStage === 'between-jobs' && context.stressLevel === 'high') {
      // Under stress, inferior function can temporarily spike
      const bottomTwo = normalizedScores.rankings.slice(-2);
      const spiking = bottomTwo.filter(fn =>
        normalizedScores.globalNormalized[fn] >= 60
      );
      if (spiking.length > 0) {
        indicators.push({
          type: 'life-stage-pressure',
          description:
            'Being between jobs under high stress can trigger unusual behavior — using thinking styles you don\'t normally rely on. Some of your answers might reflect this temporary stress response rather than your baseline personality.',
          affectedFunctions: spiking,
          magnitude: 0.4,
        });
      }
    }
  }

  // Mental state bias
  if (context?.mentalEnergy === 'anxious' && normalizedScores.globalNormalized['Ni'] >= 70) {
    indicators.push({
      type: 'mental-state',
      description:
        'You mentioned your mind is racing and overthinking. That anxious state can look a lot like strong Ni (focused intuition) — the pattern-seeing might be anxiety-driven rather than your natural wiring.',
      affectedFunctions: ['Ni'],
      magnitude: 0.4,
    });
  }

  if (context?.mentalEnergy === 'scattered' && normalizedScores.globalNormalized['Ne'] >= 70) {
    indicators.push({
      type: 'mental-state',
      description:
        'You said your mind feels scattered and restless. That can inflate Ne (idea exploration) scores — jumping between ideas might be restlessness rather than genuine divergent thinking.',
      affectedFunctions: ['Ne'],
      magnitude: 0.35,
    });
  }

  if (context?.mentalEnergy === 'low') {
    const seScore = normalizedScores.globalNormalized['Se'];
    const neScore = normalizedScores.globalNormalized['Ne'];
    if (seScore <= 30 && neScore <= 30) {
      indicators.push({
        type: 'mental-state',
        description:
          'You mentioned low energy and motivation. That can suppress your perceiving functions (Se and Ne) — you might score higher on these when you\'re feeling more like yourself.',
        affectedFunctions: ['Se', 'Ne'],
        magnitude: 0.3,
      });
    }
  }

  // Cultural conditioning bias
  if (context?.culturalValues === 'collectivist' && normalizedScores.globalNormalized['Fe'] >= 65) {
    indicators.push({
      type: 'cultural-conditioning',
      description:
        'You grew up in a group-harmony culture, and your Fe (social harmony) scores are high. That might be trained behavior from your upbringing rather than your natural wiring.',
      affectedFunctions: ['Fe'],
      magnitude: 0.3,
    });
  }

  if (context?.culturalValues === 'individualist') {
    const flagged: CognitiveFunction[] = [];
    if (normalizedScores.globalNormalized['Fi'] >= 65) flagged.push('Fi');
    if (normalizedScores.globalNormalized['Te'] >= 65) flagged.push('Te');
    if (flagged.length > 0) {
      indicators.push({
        type: 'cultural-conditioning',
        description:
          `You grew up valuing individual achievement, and your ${flagged.join('/')} scores are high. That could be culturally trained independence rather than pure natural preference.`,
        affectedFunctions: flagged,
        magnitude: 0.3,
      });
    }
  }

  return indicators;
}
