import type { Question } from '@/types/questions';

/**
 * Dedicated stress/grip behavior questions.
 * These help identify inferior function by examining behavior under extreme stress.
 */
export const STRESS_QUESTIONS: Question[] = [
  {
    id: 'str-01',
    primaryAxis: ['Fe', 'Te'],
    category: 'stress-response',
    text: 'When you\'ve been alone and stressed for too long, you\'re more likely to:',
    options: [
      {
        id: 'str-01-a',
        text: 'Blow up emotionally out of nowhere — sudden anger or crying that shocks even you.',
        functionWeights: { Fe: 2 }, // Fe grip (Ti-dom under stress)
      },
      {
        id: 'str-01-b',
        text: 'Become super controlling and critical — obsessing over doing things the "right" way and pointing out everyone\'s mistakes.',
        functionWeights: { Te: 2 }, // Te grip (Fi-dom under stress)
      },
    ],
    chunk: 3,
    weight: 0.8,
  },
  {
    id: 'str-02',
    primaryAxis: ['Se', 'Ne'],
    category: 'stress-response',
    text: 'At your absolute lowest, you tend to:',
    options: [
      {
        id: 'str-02-a',
        text: 'Overdo it on comfort stuff — eating too much, binge-watching, impulse shopping, or drinking to numb the pain.',
        functionWeights: { Se: 2 }, // Se grip (Ni-dom under stress)
      },
      {
        id: 'str-02-b',
        text: 'Get stuck in worst-case thinking — every little problem feels like proof that everything is falling apart.',
        functionWeights: { Ne: 2 }, // Ne grip (Si-dom under stress)
      },
    ],
    chunk: 3,
    weight: 0.8,
  },
];
