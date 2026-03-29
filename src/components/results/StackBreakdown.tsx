'use client';

import { motion } from 'motion/react';
import type { FunctionStack, MBTIType } from '@/types/stacks';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { FUNCTION_COLORS, FUNCTION_LABELS } from '@/lib/constants';

interface StackBreakdownProps {
  stack: FunctionStack;
}

const POSITION_INFO = {
  dominant: {
    title: 'Your superpower',
    subtitle: 'This is how your brain works most naturally. It runs in the background all the time.',
  },
  auxiliary: {
    title: 'Your sidekick',
    subtitle: 'This backs up your main strength. You lean on it whenever your superpower needs help.',
  },
  tertiary: {
    title: 'Your growing edge',
    subtitle: 'You\'re still developing this one. It comes out more as you get older and wiser.',
  },
  inferior: {
    title: 'Your blind spot',
    subtitle: 'This is your weakest area. It can trip you up, especially under stress.',
  },
} as const;

/**
 * Type-specific descriptions for each stack position.
 * Each type gets 4 unique descriptions that reflect how the functions
 * interact with each other in that particular stack.
 */
const TYPE_DESCRIPTIONS: Record<MBTIType, Record<string, string>> = {
  INTJ: {
    dominant: 'You have a powerful inner vision. You naturally see how things will unfold in the future and you trust your gut instincts about the big picture. While others focus on what\'s right in front of them, you\'re already ten steps ahead.',
    auxiliary: 'You turn your visions into real plans. When your gut tells you where things are headed, your practical side kicks in to build a strategy, organize the steps, and make it actually happen.',
    tertiary: 'You\'re developing a deeper connection to your personal values. As you mature, you start caring more about what feels authentic to you — not just what\'s effective. You may surprise people with how much you quietly care.',
    inferior: 'Living in the moment and enjoying physical experiences doesn\'t come naturally to you. Under stress, you might overindulge in food, shopping, or sensory pleasures — things that feel very "not you."',
  },
  INTP: {
    dominant: 'Your brain is a logic machine. You love taking things apart mentally to understand how they work. You build internal frameworks and models, always searching for the most precise and accurate explanation.',
    auxiliary: 'Your mind constantly generates new ideas and connections. It feeds your logical side with "what if" possibilities, helping you explore theories from every angle instead of getting stuck on just one.',
    tertiary: 'You\'re slowly developing a better memory for details and practical experience. As you grow, you get better at learning from past mistakes instead of always reinventing the wheel.',
    inferior: 'Social emotions and group harmony can feel like a foreign language. Under stress, you might lash out at people, desperately seek approval, or feel like everyone secretly dislikes you.',
  },
  ENTJ: {
    dominant: 'You\'re a natural leader and organizer. You see inefficiency and immediately want to fix it. You think out loud, make decisive plans, and push everyone (including yourself) toward results.',
    auxiliary: 'You have sharp intuition about where things are heading. It helps you make strategic long-term plans instead of just putting out fires — you see the bigger picture behind the immediate task.',
    tertiary: 'You\'re developing a taste for hands-on, in-the-moment experiences. As you mature, you learn to enjoy the present instead of always charging toward the next goal.',
    inferior: 'Deep personal emotions and values can catch you off guard. Under stress, you might feel unexpectedly sensitive, take things too personally, or worry that nobody truly cares about you.',
  },
  ENTP: {
    dominant: 'Your mind is an idea factory. You see possibilities everywhere, love playing devil\'s advocate, and get bored the second something becomes routine. You connect dots that nobody else even notices.',
    auxiliary: 'You have a sharp inner logic that helps you analyze your many ideas. It\'s the filter that sorts the brilliant ideas from the crazy ones — though you enjoy entertaining both.',
    tertiary: 'You\'re slowly getting better at reading people\'s feelings and caring about group harmony. You\'re learning that winning the argument isn\'t always worth it if it hurts someone.',
    inferior: 'Routines, details, and sticking with tradition feel suffocating. Under stress, you might get obsessive about small details, fixate on past mistakes, or feel like your body is falling apart.',
  },
  INFJ: {
    dominant: 'You have deep, almost mysterious intuition. You "just know" things about people and situations without being able to explain how. You see hidden patterns and meanings that others completely miss.',
    auxiliary: 'You naturally tune into other people\'s emotions and needs. Your care for others gives your insights a purpose — you don\'t just see what\'s going on, you want to help people with what you see.',
    tertiary: 'You\'re developing your analytical side. As you grow, you get better at using logic to back up your gut feelings, making your insights more structured and harder to dismiss.',
    inferior: 'The physical, sensory world can feel overwhelming. Under stress, you might binge on food, shopping, or TV — or become weirdly obsessed with how you look or how your body feels.',
  },
  INFP: {
    dominant: 'You have a rich inner emotional world. You know exactly what matters to you at the deepest level, and you live by those values even when it\'s hard. Authenticity isn\'t a buzzword for you — it\'s everything.',
    auxiliary: 'Your imagination is always running. It feeds your values with creative possibilities — new ways to express yourself, new causes to care about, new ways the world could be better.',
    tertiary: 'You\'re developing a better sense for details and practical experience. Over time, you get better at remembering what worked before and building reliable habits.',
    inferior: 'Organizing, managing, and being "productive" in the traditional sense feels exhausting. Under stress, you might become unexpectedly bossy, obsess over getting things done, or feel like a failure for not being more efficient.',
  },
  ENFJ: {
    dominant: 'You\'re a people person at your core. You naturally feel what others are feeling, bring groups together, and inspire people to be their best selves. Harmony and connection are your lifeblood.',
    auxiliary: 'You have strong intuition about people and where things are headed. It helps you guide others not just based on what they need now, but what will be best for them long-term.',
    tertiary: 'You\'re developing a better connection to the physical, present moment. As you grow, you learn to enjoy sensory experiences and live more in the "now" instead of always focusing on others.',
    inferior: 'Cold logic and impersonal analysis can feel threatening. Under stress, you might become overly critical, nitpick everyone\'s reasoning, or feel paralyzed trying to find the "objectively right" answer.',
  },
  ENFP: {
    dominant: 'You see the world as full of exciting possibilities. Your mind bounces from idea to idea, you light up around new people and experiences, and you genuinely believe things can always get better.',
    auxiliary: 'You have a deep inner sense of what\'s authentic and meaningful. It grounds your wild ideas by asking "but does this actually matter to me?" — keeping you true to yourself amidst all the excitement.',
    tertiary: 'You\'re developing your practical, get-things-done side. Over time, you get better at following through, organizing your ideas, and turning your visions into actual results.',
    inferior: 'Routine, tradition, and detailed history bore you to tears. Under stress, you might get weirdly fixated on past events, obsess over minor body symptoms, or cling to familiar habits out of fear.',
  },
  ISTJ: {
    dominant: 'You have an incredible memory and eye for detail. You learn from experience, build reliable systems, and notice immediately when something is out of place. People count on you because you\'re thorough and dependable.',
    auxiliary: 'You\'re great at organizing and executing plans. Your practical side takes everything you\'ve learned from experience and turns it into efficient, step-by-step action.',
    tertiary: 'You\'re developing your emotional awareness. Over time, you start paying more attention to what truly matters to you personally, beyond just duty and responsibility.',
    inferior: 'Big-picture brainstorming and abstract possibilities feel chaotic. Under stress, you might catastrophize about the future, see doom around every corner, or feel paralyzed by too many "what ifs."',
  },
  ISFJ: {
    dominant: 'You remember everything — not just facts, but how things felt. You use this deep sense of experience to take care of people and maintain the traditions and routines that keep life stable.',
    auxiliary: 'You naturally feel what others need. Your caring side uses all that stored experience to help people in practical, thoughtful ways — you\'re the person who remembers everyone\'s preferences.',
    tertiary: 'You\'re developing your analytical skills. As you grow, you get better at thinking through problems logically instead of just going with what\'s familiar.',
    inferior: 'New, untested possibilities can feel scary. Under stress, you might imagine worst-case scenarios, see negative patterns everywhere, or feel overwhelmed by all the things that could go wrong.',
  },
  ESTJ: {
    dominant: 'You\'re a born organizer and leader. You see what needs to get done and you make it happen — no excuses. You value efficiency, clear rules, and measurable results.',
    auxiliary: 'You lean on your experience and memory to make good decisions. Instead of guessing, you draw from what\'s worked before and apply proven methods to new problems.',
    tertiary: 'You\'re developing your creative, possibility-seeing side. Over time, you become more open to new ideas and less rigid about always doing things the established way.',
    inferior: 'Deep personal feelings and emotional vulnerability are uncomfortable territory. Under stress, you might feel unexpectedly hurt, take things too personally, or worry that people don\'t care about you.',
  },
  ESFJ: {
    dominant: 'You\'re the heart of every group. You naturally sense what people need, create warm environments, and make sure nobody feels left out. Taking care of others isn\'t a chore for you — it\'s who you are.',
    auxiliary: 'You draw on past experience and tradition to take care of people. You remember what worked, what people liked, and what made them comfortable — and you use that knowledge every day.',
    tertiary: 'You\'re developing your brainstorming side. As you grow, you become more comfortable with new ideas and less dependent on "the way things have always been done."',
    inferior: 'Impersonal logic and cold analysis feel harsh. Under stress, you might become overly critical, obsess over finding logical flaws, or feel like nobody appreciates your thinking skills.',
  },
  ISTP: {
    dominant: 'You\'re a quiet problem-solver who figures things out by taking them apart — literally or mentally. You understand how systems, tools, and machines work at a deep level, and you fix things others can\'t.',
    auxiliary: 'You\'re very tuned into the physical world. You notice details others miss, react quickly to what\'s happening around you, and prefer hands-on action over sitting around talking about it.',
    tertiary: 'You\'re developing your sense of future vision. Over time, you get better at seeing where things are headed long-term, not just what\'s happening in front of you right now.',
    inferior: 'Big emotional situations and group feelings can overwhelm you. Under stress, you might blow up at people unexpectedly, seek validation you\'d normally never ask for, or feel like everyone is judging you.',
  },
  ISFP: {
    dominant: 'You have a deeply personal sense of what\'s beautiful, meaningful, and right. You experience emotions intensely and authentically, and you express yourself through actions and art more than words.',
    auxiliary: 'You\'re very present and tuned into the physical world. You notice beauty in everyday things, enjoy hands-on experiences, and express your inner values through what you do, make, and create.',
    tertiary: 'You\'re developing your intuitive side. Over time, you get better at seeing hidden meanings and trusting gut feelings about where things are headed.',
    inferior: 'Structure, deadlines, and being "productive" feel soul-crushing. Under stress, you might become uncharacteristically bossy, obsess over organizing everything, or harshly judge everyone\'s competence.',
  },
  ESTP: {
    dominant: 'You\'re fully alive in the moment. You notice everything, react faster than anyone, and love diving into action. You\'d rather try something and see what happens than sit around planning forever.',
    auxiliary: 'You have sharp problem-solving skills that work on the fly. While you\'re in the middle of action, your logical side quickly analyzes what\'s happening and finds the smartest move.',
    tertiary: 'You\'re developing your people skills. Over time, you get better at reading the room emotionally and caring about how your actions affect the people around you.',
    inferior: 'Deep thinking about the future and hidden meanings feels pointless to you. Under stress, you might get dark premonitions, become paranoid about what\'s coming, or fixate on one catastrophic outcome.',
  },
  ESFP: {
    dominant: 'You light up every room you walk into. You\'re tuned into the moment, love new experiences, and bring energy and fun wherever you go. Life is meant to be lived, and you live it fully.',
    auxiliary: 'You have a warm, genuine emotional core. Behind the fun exterior, you deeply care about being real and staying true to yourself. You can tell instantly when something feels fake.',
    tertiary: 'You\'re developing your practical, organized side. Over time, you get better at following through on plans and turning your fun ideas into something that actually lasts.',
    inferior: 'Abstract theories and deep "meaning of life" thinking feel draining. Under stress, you might get stuck in dark thoughts about the future, feel like doom is approaching, or become unusually paranoid.',
  },
};

const POSITIONS = ['dominant', 'auxiliary', 'tertiary', 'inferior'] as const;

export function StackBreakdown({ stack }: StackBreakdownProps) {
  const typeDescs = TYPE_DESCRIPTIONS[stack.type];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-1">
        Your thinking style, explained
      </h3>
      <p className="text-xs text-muted mb-6">What each part of your {stack.type} personality does for you</p>

      <div className="space-y-4">
        {POSITIONS.map((pos, i) => {
          const fn = stack[pos] as CognitiveFunction;
          const color = FUNCTION_COLORS[fn];
          const info = POSITION_INFO[pos];
          const description = typeDescs?.[pos] || '';

          return (
            <motion.div
              key={pos}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="p-4 rounded-xl bg-surface/40 border border-border/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold border border-white/10"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 4px 16px ${color}35`,
                  }}
                >
                  {fn}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {info.title} — {FUNCTION_LABELS[fn]}
                  </p>
                  <p className="text-xs text-muted">{info.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed pl-[52px]">
                {description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
