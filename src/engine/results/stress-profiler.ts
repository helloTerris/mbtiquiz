import type { FunctionStack } from '@/types/stacks';
import type { MBTIType } from '@/types/stacks';
import type { NormalizedScores } from '@/types/scoring';
import type { StressProfile } from '@/types/results';
import { FUNCTION_LABELS } from '@/lib/constants';

/**
 * Type-specific stress profiles.
 * Each type experiences their inferior function differently because
 * the whole stack context matters — not just which function is weakest.
 */
const TYPE_STRESS: Record<MBTIType, { description: string; behaviors: string[] }> = {
  INTJ: {
    description: 'You normally live in your head — planning, strategizing, seeing the future. But when you\'re really burned out, your body takes over. You might suddenly become obsessed with physical comfort, appearances, or sensory pleasures in ways that feel completely out of character.',
    behaviors: [
      'Binge-watching, overeating, or going on shopping sprees out of nowhere',
      'Getting weirdly obsessed with how you look or how your space looks',
      'Zoning out into mindless physical activities instead of thinking',
      'Feeling trapped in your body — like your mind can\'t escape the present moment',
    ],
  },
  INTP: {
    description: 'You normally keep your cool and stay in your logical bubble. But when you\'re at your breaking point, emotions you didn\'t even know you had come flooding out. Suddenly you care desperately about what people think of you.',
    behaviors: [
      'Snapping at people or having emotional outbursts that shock even you',
      'Desperately wanting someone to tell you they care about you',
      'Feeling like everyone secretly thinks you\'re weird or annoying',
      'Reading way too much into people\'s tone of voice or body language',
    ],
  },
  ENTJ: {
    description: 'You\'re usually tough, decisive, and focused on the mission. But when stress really gets to you, your softer side comes crashing through. Deep personal feelings you normally keep locked away suddenly take over.',
    behaviors: [
      'Getting your feelings hurt by things you\'d normally brush off',
      'Feeling unappreciated or unloved — even if there\'s no evidence for it',
      'Withdrawing from people and quietly stewing in emotion',
      'Making things personal that have nothing to do with you',
    ],
  },
  ENTP: {
    description: 'You\'re normally flexible, spontaneous, and open to anything new. But extreme stress makes you do a total 180 — you become rigid, detail-obsessed, and stuck on things from the past.',
    behaviors: [
      'Obsessing over tiny physical details or health symptoms',
      'Clinging to a familiar routine like a security blanket',
      'Replaying past conversations and beating yourself up over what you said',
      'Feeling like your body is falling apart — every ache becomes a crisis',
    ],
  },
  INFJ: {
    description: 'You usually live in a world of meaning, purpose, and deep connections. But when you\'re truly exhausted, the physical world overwhelms you. You might lose yourself in sensory excess as a way to escape your own mind.',
    behaviors: [
      'Binge eating, binge watching, or impulsive shopping to numb out',
      'Becoming uncharacteristically focused on appearances or material things',
      'Acting reckless or impulsive — the opposite of your careful nature',
      'Feeling completely disconnected from your sense of purpose',
    ],
  },
  INFP: {
    description: 'You normally go with the flow and care deeply about authenticity over efficiency. But when you hit your limit, your inner drill sergeant comes out. Suddenly you become obsessed with productivity, control, and doing things "the right way."',
    behaviors: [
      'Snapping at people for being "incompetent" or "lazy"',
      'Making harsh to-do lists and then feeling crushed when you can\'t finish them',
      'Becoming unusually bossy or controlling about how things should be done',
      'Measuring your worth by how much you got done today — and always falling short',
    ],
  },
  ENFJ: {
    description: 'You\'re normally warm, supportive, and focused on people. But when stress pushes you to the edge, your cold logical side takes over. You start picking apart everyone\'s arguments and getting critical in a way that doesn\'t feel like you.',
    behaviors: [
      'Nitpicking people\'s reasoning and pointing out logical flaws',
      'Withdrawing from everyone to "think things through" alone',
      'Becoming harshly critical — of yourself and others',
      'Feeling paralyzed trying to find the "objectively correct" answer to everything',
    ],
  },
  ENFP: {
    description: 'You normally embrace change and chase new experiences. But when you\'re really struggling, you flip into a rigid, fearful state — clinging to what\'s familiar and panicking about things from the past.',
    behaviors: [
      'Fixating on a past mistake or embarrassing moment you can\'t let go of',
      'Suddenly needing everything to be neat, organized, and predictable',
      'Worrying obsessively about health symptoms or physical discomfort',
      'Feeling like nothing new will ever work — only what\'s been tried before is safe',
    ],
  },
  ISTJ: {
    description: 'You\'re normally grounded, practical, and focused on what\'s real and proven. But when stress overwhelms you, your mind starts spiraling into dark "what if" territory — imagining worst-case scenarios that haven\'t happened yet.',
    behaviors: [
      'Catastrophizing about the future — seeing doom around every corner',
      'Jumping to wild conclusions based on tiny clues that "something is wrong"',
      'Feeling overwhelmed by all the possible things that could go wrong',
      'Becoming paranoid that hidden forces are working against you',
    ],
  },
  ISFJ: {
    description: 'You\'re normally steady, caring, and focused on keeping things running smoothly. But when you\'re truly burned out, your mind turns against you — you start imagining terrible possibilities and seeing bad omens everywhere.',
    behaviors: [
      'Spiraling into worst-case thinking about your health, relationships, or future',
      'Seeing hidden negative meanings in things people say or do',
      'Feeling paralyzed by all the bad things that "might" happen',
      'Having sudden outbursts of pessimism that shock the people around you',
    ],
  },
  ESTJ: {
    description: 'You\'re normally tough, practical, and in control. But extreme stress cracks that armor — deep feelings of being unloved or unappreciated come flooding in. The emotional side you usually keep locked away demands to be heard.',
    behaviors: [
      'Taking criticism way more personally than usual',
      'Feeling like nobody appreciates everything you do for them',
      'Getting unexpectedly teary or sentimental about small things',
      'Withdrawing and questioning whether your relationships are genuine',
    ],
  },
  ESFJ: {
    description: 'You\'re normally warm, organized, and people-focused. But when you\'re pushed too far, a cold, overly analytical side comes out. You start obsessing over logic and fairness in a way that feels harsh — even to you.',
    behaviors: [
      'Becoming unusually critical and pointing out everyone\'s logical mistakes',
      'Withdrawing from social situations to "figure things out" alone',
      'Obsessing over whether something is "technically correct" instead of helpful',
      'Feeling like your emotional intelligence doesn\'t matter — only cold hard facts do',
    ],
  },
  ISTP: {
    description: 'You\'re normally cool, independent, and unbothered by drama. But when stress really hits, your emotional dam breaks. Feelings you\'ve been ignoring suddenly explode outward, and you might act in ways that seem totally unlike you.',
    behaviors: [
      'Blowing up at someone over something that normally wouldn\'t faze you',
      'Suddenly needing reassurance and approval from people around you',
      'Feeling like everyone is judging you or talking behind your back',
      'Getting deeply hurt by offhand comments and not knowing how to process it',
    ],
  },
  ISFP: {
    description: 'You normally go with the flow and value personal freedom above all. But when stress pushes you over the edge, your inner control freak emerges. You become obsessed with organizing, planning, and making everyone do things "properly."',
    behaviors: [
      'Becoming uncharacteristically bossy and telling everyone what to do',
      'Obsessing over productivity and feeling worthless if you\'re not "achieving"',
      'Getting harsh and critical about how others handle their responsibilities',
      'Creating rigid plans and schedules — then melting down when they don\'t work',
    ],
  },
  ESTP: {
    description: 'You live for action and the present moment. But extreme stress pulls you into a dark mental space you\'re not used to. You start fixating on the future, seeing one terrible outcome you can\'t shake, and losing your usual optimism.',
    behaviors: [
      'Getting a strong, dark "gut feeling" that something terrible is coming',
      'Fixating on one specific worst-case outcome and being unable to let it go',
      'Feeling like your future is predetermined and there\'s nothing you can do',
      'Becoming unusually withdrawn and lost in your own head',
    ],
  },
  ESFP: {
    description: 'You\'re normally the life of the party — fun, present, and full of energy. But when life really beats you down, a dark, philosophical side you barely recognize takes over. You become obsessed with deep "meaning" questions you can\'t answer.',
    behaviors: [
      'Getting caught in existential thoughts like "what\'s the point of all this?"',
      'Feeling a sense of doom or that something bad is inevitable',
      'Becoming unusually quiet and introspective — the opposite of your normal self',
      'Fixating on one dark vision of how things will turn out and refusing to see alternatives',
    ],
  },
};

export function profileStress(
  stack: FunctionStack,
  normalizedScores: NormalizedScores
): StressProfile {
  const inferiorFn = stack.inferior;

  const typeStress = TYPE_STRESS[stack.type];
  const gripBehaviors = typeStress?.behaviors || [];
  const description = typeStress?.description || '';

  // Check how much the inferior function actually showed up in scores
  const infRank = normalizedScores.rankings.indexOf(inferiorFn);
  const stressQuestionAlignment = infRank <= 3 ? 30 : infRank <= 5 ? 60 : 85;

  return {
    inferiorFunction: inferiorFn,
    gripBehaviors,
    stressQuestionAlignment,
    description,
  };
}
