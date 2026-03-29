import type { Question } from '@/types/questions';

/**
 * Core question bank: 40 forced-choice questions.
 *
 * Design principles:
 * - Every question maps to a function PAIR (Ti vs Te, not "are you logical?")
 * - Force tradeoffs — no neutral/middle options
 * - Test each axis across multiple contexts (decision, social, stress, work, default-vs-forced)
 * - Include redundancy pairs for contradiction detection
 * - Include stress/grip questions for inferior function detection
 * - Include "default vs forced" questions to strip environment pressure
 */
export const CORE_QUESTIONS: Question[] = [
  // ============================================================
  // CHUNK 1: Core Function Preferences (10 questions)
  // ============================================================

  // Q1: Ti vs Te — decision-making
  {
    id: 'c1-01',
    primaryAxis: ['Ti', 'Te'],
    category: 'decision-making',
    text: 'When you\'re trying to figure out a tough problem:',
    options: [
      {
        id: 'c1-01-a',
        text: 'You work it out yourself from scratch — you need to fully understand the "why" before you do anything.',
        functionWeights: { Ti: 2 },
      },
      {
        id: 'c1-01-b',
        text: 'You find a method that already works and use it — getting results matters more than understanding every detail.',
        functionWeights: { Te: 2 },
      },
    ],
    contextVariants: [
      {
        lifeStage: 'student',
        questionText: 'When you have a really tough assignment:',
        options: [
          {
            id: 'c1-01-a-s',
            text: 'You work through the material yourself until you really get it, even if it takes longer.',
            functionWeights: { Ti: 2 },
          },
          {
            id: 'c1-01-b-s',
            text: 'You find the best study guides and proven methods to get the right answer quickly.',
            functionWeights: { Te: 2 },
          },
        ],
      },
      {
        lifeStage: 'early-career',
        questionText: 'When you\'re faced with a tough problem at work:',
        options: [
          {
            id: 'c1-01-a-e',
            text: 'You dig into the underlying logic yourself until you really understand it, even if it slows you down.',
            functionWeights: { Ti: 2 },
          },
          {
            id: 'c1-01-b-e',
            text: 'You find the best existing approach or ask someone experienced — getting it done right and fast matters more.',
            functionWeights: { Te: 2 },
          },
        ],
      },
      {
        lifeStage: 'mid-career',
        questionText: 'When you run into a complex challenge in your field:',
        options: [
          {
            id: 'c1-01-a-m',
            text: 'You need to break it down and understand the mechanics yourself before deciding on an approach.',
            functionWeights: { Ti: 2 },
          },
          {
            id: 'c1-01-b-m',
            text: 'You draw on proven frameworks and expert resources — efficient execution beats reinventing the wheel.',
            functionWeights: { Te: 2 },
          },
        ],
      },
    ],
    chunk: 1,
    weight: 1.0,
  },

  // Q2: Fi vs Fe — social-interaction
  {
    id: 'c1-02',
    primaryAxis: ['Fi', 'Fe'],
    category: 'social-interaction',
    text: 'Everyone in your group agrees on something, but you disagree. You would probably:',
    options: [
      {
        id: 'c1-02-a',
        text: 'Say what you really think — being honest about where you stand matters more than keeping the peace.',
        functionWeights: { Fi: 2 },
      },
      {
        id: 'c1-02-b',
        text: 'Find a way to bring it up without killing the vibe — you can disagree and still keep the group feeling good.',
        functionWeights: { Fe: 2 },
      },
    ],
    chunk: 1,
    weight: 1.0,
  },

  // Q3: Ni vs Ne — information-processing
  {
    id: 'c1-03',
    primaryAxis: ['Ni', 'Ne'],
    category: 'information-processing',
    text: 'When you think about the future, your mind usually:',
    options: [
      {
        id: 'c1-03-a',
        text: 'Zeros in on one likely outcome — you just know where things are headed.',
        functionWeights: { Ni: 2 },
      },
      {
        id: 'c1-03-b',
        text: 'Jumps between many possible outcomes — you see a bunch of different paths at once.',
        functionWeights: { Ne: 2 },
      },
    ],
    chunk: 1,
    weight: 1.0,
  },

  // Q4: Si vs Se — information-processing
  {
    id: 'c1-04',
    primaryAxis: ['Si', 'Se'],
    category: 'information-processing',
    text: 'You get more energy from:',
    options: [
      {
        id: 'c1-04-a',
        text: 'Looking back on what\'s worked before — sticking with what you know feels safe and solid.',
        functionWeights: { Si: 2 },
      },
      {
        id: 'c1-04-b',
        text: 'Jumping into whatever\'s happening right now — new sights, sounds, and experiences get you excited.',
        functionWeights: { Se: 2 },
      },
    ],
    chunk: 1,
    weight: 1.0,
  },

  // Q5: Ti vs Te — work-style (redundancy of Q1)
  {
    id: 'c1-05',
    primaryAxis: ['Ti', 'Te'],
    category: 'work-style',
    text: 'When you disagree with something most people accept as true, you:',
    options: [
      {
        id: 'c1-05-a',
        text: 'Pick it apart yourself to find where the logic breaks — you trust your own thinking.',
        functionWeights: { Ti: 2 },
      },
      {
        id: 'c1-05-b',
        text: 'Look for studies, articles, or expert opinions to back up your doubt — proof from outside sources matters.',
        functionWeights: { Te: 2 },
      },
    ],
    contextVariants: [
      {
        lifeStage: 'student',
        questionText: 'When something your teacher or textbook says doesn\'t sit right with you, you:',
        options: [
          {
            id: 'c1-05-a-s',
            text: 'Work through the logic yourself to figure out where it falls apart — you trust your own reasoning.',
            functionWeights: { Ti: 2 },
          },
          {
            id: 'c1-05-b-s',
            text: 'Look up other sources or ask other experts to see if your doubt holds up — outside evidence matters.',
            functionWeights: { Te: 2 },
          },
        ],
      },
      {
        lifeStage: 'early-career',
        questionText: 'When a standard practice at work doesn\'t make sense to you, you:',
        options: [
          {
            id: 'c1-05-a-e',
            text: 'Think it through yourself to figure out where the logic breaks — you trust your own analysis.',
            functionWeights: { Ti: 2 },
          },
          {
            id: 'c1-05-b-e',
            text: 'Look for data, case studies, or ask senior people to validate your doubt — external proof matters.',
            functionWeights: { Te: 2 },
          },
        ],
      },
      {
        lifeStage: 'mid-career',
        questionText: 'When an industry standard or company policy doesn\'t add up to you, you:',
        options: [
          {
            id: 'c1-05-a-m',
            text: 'Break it down logically to find the flaw — you trust your own reasoning over established convention.',
            functionWeights: { Ti: 2 },
          },
          {
            id: 'c1-05-b-m',
            text: 'Research the evidence and consult experts — you need external backing before challenging the status quo.',
            functionWeights: { Te: 2 },
          },
        ],
      },
    ],
    redundancyOf: 'c1-01',
    chunk: 1,
    weight: 0.8,
  },

  // Q6: Fi vs Fe — decision-making
  {
    id: 'c1-06',
    primaryAxis: ['Fi', 'Fe'],
    category: 'decision-making',
    text: 'When making a big life decision, you\'re pulled more toward:',
    options: [
      {
        id: 'c1-06-a',
        text: 'What feels right to you deep down, even if others disagree.',
        functionWeights: { Fi: 2 },
      },
      {
        id: 'c1-06-b',
        text: 'What\'s best for everyone involved and keeps your relationships strong.',
        functionWeights: { Fe: 2 },
      },
    ],
    chunk: 1,
    weight: 1.0,
  },

  // Q7: Ni vs Ne — inner-world
  {
    id: 'c1-07',
    primaryAxis: ['Ni', 'Ne'],
    category: 'inner-world',
    text: 'Your creative process is more like:',
    options: [
      {
        id: 'c1-07-a',
        text: 'Boiling everything down to one big idea — you keep refining until it clicks.',
        functionWeights: { Ni: 2 },
      },
      {
        id: 'c1-07-b',
        text: 'Coming up with tons of ideas — one thought leads to five more and you love going off in new directions.',
        functionWeights: { Ne: 2 },
      },
    ],
    chunk: 1,
    weight: 1.1,
  },

  // Q8: Si vs Se — stress-response
  {
    id: 'c1-08',
    primaryAxis: ['Si', 'Se'],
    category: 'stress-response',
    text: 'When you\'re overwhelmed, you tend to:',
    options: [
      {
        id: 'c1-08-a',
        text: 'Go back to your comfort zone — familiar places, routines, and things that feel safe.',
        functionWeights: { Si: 2 },
      },
      {
        id: 'c1-08-b',
        text: 'Do something physical — exercise, go out, or stay busy with your hands to feel grounded.',
        functionWeights: { Se: 2 },
      },
    ],
    chunk: 1,
    weight: 1.0,
  },

  // Q9: Ti vs Te — social-interaction
  {
    id: 'c1-09',
    primaryAxis: ['Ti', 'Te'],
    category: 'social-interaction',
    text: 'When someone asks you to explain your reasoning, you:',
    options: [
      {
        id: 'c1-09-a',
        text: 'Struggle to put it into words — it all makes sense in your head, but it\'s hard to lay it out step by step for someone else.',
        functionWeights: { Ti: 2 },
      },
      {
        id: 'c1-09-b',
        text: 'Lay it out clearly, step by step — you\'re naturally good at organizing your thoughts so others can follow.',
        functionWeights: { Te: 2 },
      },
    ],
    chunk: 1,
    weight: 1.0,
  },

  // Q10: Fi vs Fe — inner-world
  {
    id: 'c1-10',
    primaryAxis: ['Fi', 'Fe'],
    category: 'inner-world',
    text: 'Your emotions are more like:',
    options: [
      {
        id: 'c1-10-a',
        text: 'Deep and private — you feel things strongly but rarely show it all on the outside.',
        functionWeights: { Fi: 2 },
      },
      {
        id: 'c1-10-b',
        text: 'Open and reactive — you naturally pick up on and match the mood around you.',
        functionWeights: { Fe: 2 },
      },
    ],
    chunk: 1,
    weight: 1.1,
  },

  // ============================================================
  // CHUNK 2: Contextual & Default-vs-Forced (10 questions)
  // ============================================================

  // Q11: Ti vs Te — default-vs-forced
  {
    id: 'c2-01',
    primaryAxis: ['Ti', 'Te'],
    category: 'default-vs-forced',
    text: 'If nobody would ever see or judge your work, you would:',
    options: [
      {
        id: 'c2-01-a',
        text: 'Spend extra time understanding things deeply, even with no deadline pushing you.',
        functionWeights: { Ti: 2 },
      },
      {
        id: 'c2-01-b',
        text: 'Still focus on getting things done and producing real results — that\'s just how you\'re wired.',
        functionWeights: { Te: 2 },
      },
    ],
    contextVariants: [
      {
        lifeStage: 'student',
        questionText: 'If a class had no grades and no one checked your work, you would:',
        options: [
          {
            id: 'c2-01-a-s',
            text: 'Still spend extra time making sure you actually understand the material deeply.',
            functionWeights: { Ti: 2 },
          },
          {
            id: 'c2-01-b-s',
            text: 'Still push to finish assignments and produce solid work — you just naturally want to get things done.',
            functionWeights: { Te: 2 },
          },
        ],
      },
      {
        lifeStage: 'early-career',
        questionText: 'If your boss never reviewed your work and there were no performance reviews, you would:',
        options: [
          {
            id: 'c2-01-a-e',
            text: 'Spend more time digging into things until you deeply understand them, even without pressure.',
            functionWeights: { Ti: 2 },
          },
          {
            id: 'c2-01-b-e',
            text: 'Still focus on delivering results and hitting targets — producing output is just how you operate.',
            functionWeights: { Te: 2 },
          },
        ],
      },
      {
        lifeStage: 'mid-career',
        questionText: 'If no one tracked your output and there were no KPIs or reviews, you would:',
        options: [
          {
            id: 'c2-01-a-m',
            text: 'Use the freedom to go deeper — you\'d research, analyze, and refine your understanding.',
            functionWeights: { Ti: 2 },
          },
          {
            id: 'c2-01-b-m',
            text: 'Still drive toward measurable results — you\'re naturally goal-oriented regardless of oversight.',
            functionWeights: { Te: 2 },
          },
        ],
      },
    ],
    isDefaultVsForced: true,
    chunk: 2,
    weight: 1.2,
  },

  // Q12: Ne vs Se — social-interaction
  {
    id: 'c2-02',
    primaryAxis: ['Ne', 'Se'],
    category: 'social-interaction',
    text: 'At a party or event where you don\'t know many people, you naturally:',
    options: [
      {
        id: 'c2-02-a',
        text: 'Get into interesting conversations — debating "what ifs," sharing wild ideas, brainstorming with strangers.',
        functionWeights: { Ne: 1.5, Ni: 0.5 },
      },
      {
        id: 'c2-02-b',
        text: 'Soak in the scene around you — the music, the food, the vibe, people\'s body language.',
        functionWeights: { Se: 1.5, Si: 0.5 },
      },
    ],
    contextVariants: [
      {
        lifeStage: 'student',
        questionText: 'At a campus hangout or dorm party where you don\'t know many people, you naturally:',
        options: [
          {
            id: 'c2-02-a-s',
            text: 'Get into deep or random conversations — debating weird topics, sharing ideas, brainstorming with strangers.',
            functionWeights: { Ne: 1.5, Ni: 0.5 },
          },
          {
            id: 'c2-02-b-s',
            text: 'Soak in the scene — the music, the drinks, the energy, reading people\'s body language and vibes.',
            functionWeights: { Se: 1.5, Si: 0.5 },
          },
        ],
      },
      {
        lifeStage: 'early-career',
        questionText: 'At an after-work event or gathering where you don\'t know many people, you naturally:',
        options: [
          {
            id: 'c2-02-a-e',
            text: 'Start interesting conversations — bouncing ideas around, debating "what ifs," brainstorming with new people.',
            functionWeights: { Ne: 1.5, Ni: 0.5 },
          },
          {
            id: 'c2-02-b-e',
            text: 'Take in the atmosphere — the venue, the food, the energy in the room, how people carry themselves.',
            functionWeights: { Se: 1.5, Si: 0.5 },
          },
        ],
      },
      {
        lifeStage: 'mid-career',
        questionText: 'At a networking event or conference where you don\'t know many people, you naturally:',
        options: [
          {
            id: 'c2-02-a-m',
            text: 'Get into interesting conversations — exploring ideas, debating possibilities, brainstorming with new faces.',
            functionWeights: { Ne: 1.5, Ni: 0.5 },
          },
          {
            id: 'c2-02-b-m',
            text: 'Read the room — the energy, the dynamics between people, the atmosphere and body language.',
            functionWeights: { Se: 1.5, Si: 0.5 },
          },
        ],
      },
    ],
    chunk: 2,
    weight: 1.0,
  },

  // Q13: Fi vs Fe — scenario (higher weight)
  {
    id: 'c2-03',
    primaryAxis: ['Fi', 'Fe'],
    category: 'social-interaction',
    text: 'A close friend does something you think is seriously wrong. They\'re happy about it and everyone supports them. You:',
    options: [
      {
        id: 'c2-03-a',
        text: 'Can\'t shake the feeling that it\'s wrong. You\'d speak up even if it causes drama, because your conscience won\'t let you stay quiet.',
        functionWeights: { Fi: 2.5 },
      },
      {
        id: 'c2-03-b',
        text: 'Put the friendship first. You might bring it up gently, but you wouldn\'t push hard if it\'s going to cause a rift.',
        functionWeights: { Fe: 2.5 },
      },
    ],
    chunk: 2,
    weight: 1.2,
  },

  // Q14: Ni vs Si — information-processing
  {
    id: 'c2-04',
    primaryAxis: ['Ni', 'Si'],
    category: 'information-processing',
    text: 'When you learn something new, you tend to:',
    options: [
      {
        id: 'c2-04-a',
        text: 'See how it fits into a bigger picture right away — you get those "aha!" moments out of nowhere.',
        functionWeights: { Ni: 2 },
      },
      {
        id: 'c2-04-b',
        text: 'Connect it to what you already know — you learn best by linking new info to things you\'ve experienced before.',
        functionWeights: { Si: 2 },
      },
    ],
    chunk: 2,
    weight: 1.0,
  },

  // Q15: Ne vs Se — default-vs-forced
  {
    id: 'c2-05',
    primaryAxis: ['Ne', 'Se'],
    category: 'default-vs-forced',
    text: 'On a completely free day with nothing to do, you\'d rather:',
    options: [
      {
        id: 'c2-05-a',
        text: 'Explore ideas — read, go down internet rabbit holes, brainstorm, and follow your curiosity wherever it goes.',
        functionWeights: { Ne: 2 },
      },
      {
        id: 'c2-05-b',
        text: 'Get out and do stuff — try a new place, cook something, play a sport, or just be active.',
        functionWeights: { Se: 2 },
      },
    ],
    isDefaultVsForced: true,
    chunk: 2,
    weight: 1.2,
  },

  // Q16: Ti vs Te — decision-making (different angle)
  {
    id: 'c2-06',
    primaryAxis: ['Ti', 'Te'],
    category: 'decision-making',
    text: 'When someone gives you advice, you\'re more likely to:',
    options: [
      {
        id: 'c2-06-a',
        text: 'Run it through your own logic first — it doesn\'t matter who said it, it has to make sense to you.',
        functionWeights: { Ti: 2 },
      },
      {
        id: 'c2-06-b',
        text: 'Weigh who\'s giving it and their track record — good advice from a credible source is worth following.',
        functionWeights: { Te: 2 },
      },
    ],
    chunk: 2,
    weight: 1.0,
  },

  // Q17: Fi vs Fe — default-vs-forced
  {
    id: 'c2-07',
    primaryAxis: ['Fi', 'Fe'],
    category: 'default-vs-forced',
    text: 'When nobody\'s watching and there are zero consequences, your choices are based more on:',
    options: [
      {
        id: 'c2-07-a',
        text: 'Your own sense of right and wrong — a gut feeling about what\'s moral that doesn\'t change based on who\'s around.',
        functionWeights: { Fi: 2 },
      },
      {
        id: 'c2-07-b',
        text: 'What would make people happy — you naturally think about how your choices affect others, even when no one\'s looking.',
        functionWeights: { Fe: 2 },
      },
    ],
    isDefaultVsForced: true,
    chunk: 2,
    weight: 1.2,
  },

  // Q18: Ni vs Ne — work-style
  {
    id: 'c2-08',
    primaryAxis: ['Ni', 'Ne'],
    category: 'work-style',
    text: 'When starting a new project, you:',
    options: [
      {
        id: 'c2-08-a',
        text: 'Already picture the finished product — you know exactly what you\'re building and work toward that vision.',
        functionWeights: { Ni: 2 },
      },
      {
        id: 'c2-08-b',
        text: 'Try a bunch of different directions first — you need to explore before you commit to one approach.',
        functionWeights: { Ne: 2 },
      },
    ],
    contextVariants: [
      {
        lifeStage: 'student',
        questionText: 'When starting a big assignment or school project, you:',
        options: [
          {
            id: 'c2-08-a-s',
            text: 'Already see the finished product in your head — you know your angle and work toward that vision.',
            functionWeights: { Ni: 2 },
          },
          {
            id: 'c2-08-b-s',
            text: 'Explore a bunch of different angles first — you need to brainstorm before you pick a direction.',
            functionWeights: { Ne: 2 },
          },
        ],
      },
      {
        lifeStage: 'early-career',
        questionText: 'When you get assigned a new project at work, you:',
        options: [
          {
            id: 'c2-08-a-e',
            text: 'Already picture the end result — you know what you\'re building and start working toward that goal.',
            functionWeights: { Ni: 2 },
          },
          {
            id: 'c2-08-b-e',
            text: 'Explore different approaches first — you like to test a few directions before committing to one.',
            functionWeights: { Ne: 2 },
          },
        ],
      },
      {
        lifeStage: 'mid-career',
        questionText: 'When kicking off a new initiative or strategy, you:',
        options: [
          {
            id: 'c2-08-a-m',
            text: 'Already have a clear vision of the outcome — you set the direction and drive toward it.',
            functionWeights: { Ni: 2 },
          },
          {
            id: 'c2-08-b-m',
            text: 'Want to explore multiple angles first — you need to test different ideas before locking in a plan.',
            functionWeights: { Ne: 2 },
          },
        ],
      },
    ],
    chunk: 2,
    weight: 0.85,
  },

  // Q19: Si vs Se — work-style
  {
    id: 'c2-09',
    primaryAxis: ['Si', 'Se'],
    category: 'work-style',
    text: 'When it comes to routines and habits:',
    options: [
      {
        id: 'c2-09-a',
        text: 'You love them — having a set routine makes you feel stable and in control.',
        functionWeights: { Si: 2 },
      },
      {
        id: 'c2-09-b',
        text: 'They bore you — you\'d rather stay loose and respond to whatever the day throws at you.',
        functionWeights: { Se: 2 },
      },
    ],
    chunk: 2,
    weight: 0.85,
  },

  // Q20: Fi vs Fe — work-style (redundancy of Q2)
  {
    id: 'c2-10',
    primaryAxis: ['Fi', 'Fe'],
    category: 'work-style',
    text: 'When your team is heading in a direction you think is wrong:',
    options: [
      {
        id: 'c2-10-a',
        text: 'You speak up, even if it makes you unpopular — you can\'t just go along with something that feels wrong.',
        functionWeights: { Fi: 2 },
      },
      {
        id: 'c2-10-b',
        text: 'You try to steer things in a better direction without rocking the boat — keeping the team\'s spirit up matters too.',
        functionWeights: { Fe: 2 },
      },
    ],
    contextVariants: [
      {
        lifeStage: 'student',
        questionText: 'When your group project is heading in a direction you think is wrong:',
        options: [
          {
            id: 'c2-10-a-s',
            text: 'You say something, even if it makes things awkward — you can\'t go along with something that feels wrong.',
            functionWeights: { Fi: 2 },
          },
          {
            id: 'c2-10-b-s',
            text: 'You try to nudge things in a better direction without causing group drama — keeping people motivated matters.',
            functionWeights: { Fe: 2 },
          },
        ],
      },
      {
        lifeStage: 'early-career',
        questionText: 'When your team at work is heading in a direction you think is wrong:',
        options: [
          {
            id: 'c2-10-a-e',
            text: 'You speak up, even if it\'s uncomfortable — you can\'t stay quiet when something feels wrong.',
            functionWeights: { Fi: 2 },
          },
          {
            id: 'c2-10-b-e',
            text: 'You find a diplomatic way to redirect — keeping team morale up is just as important as being right.',
            functionWeights: { Fe: 2 },
          },
        ],
      },
      {
        lifeStage: 'mid-career',
        questionText: 'When your department or organization is heading in a direction you think is wrong:',
        options: [
          {
            id: 'c2-10-a-m',
            text: 'You voice your concerns clearly, even if it creates friction — you can\'t endorse something that feels wrong.',
            functionWeights: { Fi: 2 },
          },
          {
            id: 'c2-10-b-m',
            text: 'You work to influence the direction strategically — keeping alignment matters as much as the outcome.',
            functionWeights: { Fe: 2 },
          },
        ],
      },
    ],
    redundancyOf: 'c1-02',
    chunk: 2,
    weight: 0.8,
  },

  // ============================================================
  // CHUNK 3: Stress, Grip & Deeper Patterns (10 questions)
  // ============================================================

  // Q21: Ni grip vs Si grip — stress-response
  {
    id: 'c3-01',
    primaryAxis: ['Ni', 'Si'],
    category: 'stress-response',
    text: 'When you\'ve been really stressed for a long time, you\'re more likely to:',
    options: [
      {
        id: 'c3-01-a',
        text: 'Start imagining the worst possible future — you become convinced something terrible is about to happen.',
        functionWeights: { Ni: 1.5 },
      },
      {
        id: 'c3-01-b',
        text: 'Get stuck replaying past mistakes over and over — you can\'t stop thinking about what went wrong.',
        functionWeights: { Si: 1.5 },
      },
    ],
    chunk: 3,
    weight: 0.9,
  },

  // Q22: Ne grip vs Se grip — stress-response
  {
    id: 'c3-02',
    primaryAxis: ['Ne', 'Se'],
    category: 'stress-response',
    text: 'When you reach your breaking point, you tend to:',
    options: [
      {
        id: 'c3-02-a',
        text: 'Spiral into "what if" thinking — jumping between worst-case scenarios that all feel equally real.',
        functionWeights: { Ne: 1.5 },
      },
      {
        id: 'c3-02-b',
        text: 'Do something impulsive to escape — binge eating, reckless spending, or anything physical to numb the feeling.',
        functionWeights: { Se: 1.5 },
      },
    ],
    chunk: 3,
    weight: 0.9,
  },

  // Q23: Ti vs Te — stress-response
  {
    id: 'c3-03',
    primaryAxis: ['Ti', 'Te'],
    category: 'stress-response',
    text: 'When a big decision has no clear right answer, you:',
    options: [
      {
        id: 'c3-03-a',
        text: 'Keep analyzing, trying to find the perfect answer — making a move before you\'re sure feels awful.',
        functionWeights: { Ti: 2 },
      },
      {
        id: 'c3-03-b',
        text: 'Make the best call you can and move on — sitting around undecided feels worse than picking the wrong thing.',
        functionWeights: { Te: 2 },
      },
    ],
    chunk: 3,
    weight: 1.0,
  },

  // Q24: Fe vs Fi — stress-response
  {
    id: 'c3-04',
    primaryAxis: ['Fi', 'Fe'],
    category: 'stress-response',
    text: 'After a heated argument, you are more troubled by:',
    options: [
      {
        id: 'c3-04-a',
        text: 'The feeling that you went against your own beliefs or said something you didn\'t really mean.',
        functionWeights: { Fi: 2 },
      },
      {
        id: 'c3-04-b',
        text: 'The hurt feelings and awkwardness left between you and the other person.',
        functionWeights: { Fe: 2 },
      },
    ],
    chunk: 3,
    weight: 1.0,
  },

  // Q25: Ni vs Ne — decision-making
  {
    id: 'c3-05',
    primaryAxis: ['Ni', 'Ne'],
    category: 'decision-making',
    text: 'When you get a gut feeling about something, you:',
    options: [
      {
        id: 'c3-05-a',
        text: 'Trust it strongly — your gut has been right enough times that you listen to it, even when you can\'t explain why.',
        functionWeights: { Ni: 2 },
      },
      {
        id: 'c3-05-b',
        text: 'See it as just one possibility — you\'d rather explore other angles too instead of betting everything on a hunch.',
        functionWeights: { Ne: 2 },
      },
    ],
    chunk: 3,
    weight: 1.0,
  },

  // Q26: Si vs Se — decision-making
  {
    id: 'c3-06',
    primaryAxis: ['Si', 'Se'],
    category: 'decision-making',
    text: 'When choosing between two options:',
    options: [
      {
        id: 'c3-06-a',
        text: 'You go with what\'s worked before — past experience is your best guide.',
        functionWeights: { Si: 2 },
      },
      {
        id: 'c3-06-b',
        text: 'You judge the situation as it is right now — what worked last time might not work this time.',
        functionWeights: { Se: 2 },
      },
    ],
    chunk: 3,
    weight: 1.0,
  },

  // Q27: Ti vs Te — inner-world
  {
    id: 'c3-07',
    primaryAxis: ['Ti', 'Te'],
    category: 'inner-world',
    text: 'When it comes to learning and knowledge:',
    options: [
      {
        id: 'c3-07-a',
        text: 'You want to understand things deeply — you\'d rather master one topic than know a little about a lot.',
        functionWeights: { Ti: 2 },
      },
      {
        id: 'c3-07-b',
        text: 'You want knowledge you can actually use — understanding something only matters if it helps you get results.',
        functionWeights: { Te: 2 },
      },
    ],
    chunk: 3,
    weight: 1.1,
  },

  // Q28: Ni vs Ne — social-interaction (redundancy of Q3)
  {
    id: 'c3-08',
    primaryAxis: ['Ni', 'Ne'],
    category: 'social-interaction',
    text: 'In conversations, people would say you tend to:',
    options: [
      {
        id: 'c3-08-a',
        text: 'Go deep — you stick with one topic and dig into it until you get to the bottom of it.',
        functionWeights: { Ni: 2 },
      },
      {
        id: 'c3-08-b',
        text: 'Go wide — you jump from topic to topic, constantly making connections between different ideas.',
        functionWeights: { Ne: 2 },
      },
    ],
    redundancyOf: 'c1-03',
    chunk: 3,
    weight: 0.8,
  },

  // Q29: Si vs Se — inner-world (redundancy of Q4)
  {
    id: 'c3-09',
    primaryAxis: ['Si', 'Se'],
    category: 'inner-world',
    text: 'You tend to remember:',
    options: [
      {
        id: 'c3-09-a',
        text: 'Specific details — exactly what was said, how things looked, the order things happened in.',
        functionWeights: { Si: 2 },
      },
      {
        id: 'c3-09-b',
        text: 'Vivid highlights — the most intense or exciting moments stand out, but the small details and exact sequence are fuzzy.',
        functionWeights: { Se: 2 },
      },
    ],
    redundancyOf: 'c1-04',
    chunk: 3,
    weight: 0.8,
  },

  // Q30: Fe vs Te — cross-axis decision
  {
    id: 'c3-10',
    primaryAxis: ['Fe', 'Te'],
    category: 'decision-making',
    text: 'When leading a group toward a goal, you focus more on:',
    options: [
      {
        id: 'c3-10-a',
        text: 'Making sure everyone feels heard and motivated — a happy team works better.',
        functionWeights: { Fe: 2 },
      },
      {
        id: 'c3-10-b',
        text: 'Clear roles, deadlines, and accountability — structure gets things done.',
        functionWeights: { Te: 2 },
      },
    ],
    contextVariants: [
      {
        lifeStage: 'student',
        questionText: 'When leading a group project, you focus more on:',
        options: [
          {
            id: 'c3-10-a-s',
            text: 'Making sure everyone feels included and motivated — a group that gets along works better.',
            functionWeights: { Fe: 2 },
          },
          {
            id: 'c3-10-b-s',
            text: 'Dividing up tasks, setting deadlines, and keeping everyone accountable — organization gets it done.',
            functionWeights: { Te: 2 },
          },
        ],
      },
      {
        lifeStage: 'early-career',
        questionText: 'When leading a team toward a deadline, you focus more on:',
        options: [
          {
            id: 'c3-10-a-e',
            text: 'Checking in with people and keeping morale up — a team that feels supported performs better.',
            functionWeights: { Fe: 2 },
          },
          {
            id: 'c3-10-b-e',
            text: 'Setting clear priorities, assigning tasks, and tracking progress — structure drives results.',
            functionWeights: { Te: 2 },
          },
        ],
      },
      {
        lifeStage: 'mid-career',
        questionText: 'When leading your team or department toward a goal, you focus more on:',
        options: [
          {
            id: 'c3-10-a-m',
            text: 'Building trust and making sure people feel heard — an aligned, motivated team outperforms a micromanaged one.',
            functionWeights: { Fe: 2 },
          },
          {
            id: 'c3-10-b-m',
            text: 'Defining clear metrics, roles, and timelines — accountability and structure drive outcomes.',
            functionWeights: { Te: 2 },
          },
        ],
      },
    ],
    chunk: 3,
    weight: 1.0,
  },

  // ============================================================
  // CHUNK 4: Behavioral Anchors & Differentiators (10 questions)
  // ============================================================

  // Q31: Ti vs Fi — cross-process
  {
    id: 'c4-01',
    primaryAxis: ['Ti', 'Fi'],
    category: 'inner-world',
    text: 'When something really bothers you, it\'s usually because:',
    options: [
      {
        id: 'c4-01-a',
        text: 'Something doesn\'t make logical sense — things that are illogical really get under your skin.',
        functionWeights: { Ti: 2 },
      },
      {
        id: 'c4-01-b',
        text: 'Something feels unfair or fake — you can\'t stand when people act against what\'s right.',
        functionWeights: { Fi: 2 },
      },
    ],
    chunk: 4,
    weight: 1.1,
  },

  // Q32: Te vs Fe — cross-process
  {
    id: 'c4-02',
    primaryAxis: ['Te', 'Fe'],
    category: 'work-style',
    text: 'When giving feedback to someone, you lean toward:',
    options: [
      {
        id: 'c4-02-a',
        text: 'Being straight-up and honest — sugarcoating wastes time and they need to know what to fix.',
        functionWeights: { Te: 2 },
      },
      {
        id: 'c4-02-b',
        text: 'Starting with something positive — you word your criticism carefully so they don\'t lose confidence.',
        functionWeights: { Fe: 2 },
      },
    ],
    contextVariants: [
      {
        lifeStage: 'student',
        questionText: 'When giving feedback to a classmate on their work, you lean toward:',
        options: [
          {
            id: 'c4-02-a-s',
            text: 'Being straight-up about what\'s wrong — they\'ll learn more from honest criticism than nice words.',
            functionWeights: { Te: 2 },
          },
          {
            id: 'c4-02-b-s',
            text: 'Starting with what\'s good first — you word the criticism carefully so they don\'t feel bad.',
            functionWeights: { Fe: 2 },
          },
        ],
      },
      {
        lifeStage: 'early-career',
        questionText: 'When giving feedback to a coworker, you lean toward:',
        options: [
          {
            id: 'c4-02-a-e',
            text: 'Being direct about what needs fixing — sugarcoating wastes everyone\'s time.',
            functionWeights: { Te: 2 },
          },
          {
            id: 'c4-02-b-e',
            text: 'Leading with something positive — you frame the critique so they stay motivated.',
            functionWeights: { Fe: 2 },
          },
        ],
      },
      {
        lifeStage: 'mid-career',
        questionText: 'When giving feedback to someone on your team, you lean toward:',
        options: [
          {
            id: 'c4-02-a-m',
            text: 'Being clear and direct about what to improve — people respect honesty and it gets results faster.',
            functionWeights: { Te: 2 },
          },
          {
            id: 'c4-02-b-m',
            text: 'Framing it constructively — you want to build their confidence, not just point out problems.',
            functionWeights: { Fe: 2 },
          },
        ],
      },
    ],
    chunk: 4,
    weight: 0.85,
  },

  // Q33: Ni vs Si — default-vs-forced
  {
    id: 'c4-03',
    primaryAxis: ['Ni', 'Si'],
    category: 'default-vs-forced',
    text: 'When you\'re sitting with nothing to do, your mind usually drifts to:',
    options: [
      {
        id: 'c4-03-a',
        text: 'The future and "what could be" — you picture possibilities or try to figure out the deeper meaning of things.',
        functionWeights: { Ni: 2 },
      },
      {
        id: 'c4-03-b',
        text: 'The past and memories — you replay old moments, remember specific details, and revisit things that happened.',
        functionWeights: { Si: 2 },
      },
    ],
    isDefaultVsForced: true,
    chunk: 4,
    weight: 1.2,
  },

  // Q34: Ne vs Se — decision-making
  {
    id: 'c4-04',
    primaryAxis: ['Ne', 'Se'],
    category: 'decision-making',
    text: 'When deciding what to do next, you\'re more influenced by:',
    options: [
      {
        id: 'c4-04-a',
        text: 'What sounds interesting and new — the idea of something exciting matters more than what\'s right in front of you.',
        functionWeights: { Ne: 2 },
      },
      {
        id: 'c4-04-b',
        text: 'What\'s right in front of you — you go with whatever opportunity shows up in the moment.',
        functionWeights: { Se: 2 },
      },
    ],
    chunk: 4,
    weight: 1.0,
  },

  // Q35: Energy direction (I vs E attitude indicator)
  {
    id: 'c4-05',
    primaryAxis: ['Ti', 'Te'],
    category: 'social-interaction',
    text: 'When it comes to how you think things through:',
    options: [
      {
        id: 'c4-05-a',
        text: 'You think before you speak — your best ideas come from quiet reflection, not talking it out.',
        functionWeights: { Ti: 1, Ni: 0.5, Fi: 0.5 },
      },
      {
        id: 'c4-05-b',
        text: 'You think out loud — your ideas become clearer as you talk them through with someone.',
        functionWeights: { Te: 1, Ne: 0.5, Fe: 0.5 },
      },
    ],
    chunk: 4,
    weight: 1.0,
  },

  // Q36: Decision latency
  {
    id: 'c4-06',
    primaryAxis: ['Te', 'Ti'],
    category: 'decision-making',
    text: 'When it comes to making decisions:',
    options: [
      {
        id: 'c4-06-a',
        text: 'You take your time — rushing feels careless, and you\'d rather wait than make the wrong call.',
        functionWeights: { Ti: 1.5, Ni: 0.5 },
      },
      {
        id: 'c4-06-b',
        text: 'You decide fast and adjust later — a good-enough choice now beats a perfect choice that comes too late.',
        functionWeights: { Te: 1.5, Se: 0.5 },
      },
    ],
    chunk: 4,
    weight: 1.0,
  },

  // Q37: Consistency check — logic vs values (redundancy of Q1/Q6 cross-check)
  {
    id: 'c4-07',
    primaryAxis: ['Ti', 'Fi'],
    category: 'decision-making',
    text: 'When your head says one thing and your heart says another, you usually go with:',
    options: [
      {
        id: 'c4-07-a',
        text: 'Your head — even if it doesn\'t feel great, you trust what makes logical sense over what just feels right.',
        functionWeights: { Ti: 2 },
      },
      {
        id: 'c4-07-b',
        text: 'Your heart — even if the logic says otherwise, some things are just non-negotiable for you.',
        functionWeights: { Fi: 2 },
      },
    ],
    chunk: 4,
    weight: 1.0,
  },

  // Q38: Structure vs freedom (Te/Si vs Ne/Se indicator)
  {
    id: 'c4-08',
    primaryAxis: ['Si', 'Ne'],
    category: 'work-style',
    text: 'You feel most productive when:',
    options: [
      {
        id: 'c4-08-a',
        text: 'You have a clear plan and know exactly what comes next.',
        functionWeights: { Si: 1.5, Te: 0.5 },
      },
      {
        id: 'c4-08-b',
        text: 'You have the freedom to explore and follow whatever feels most promising.',
        functionWeights: { Ne: 1.5, Ti: 0.5 },
      },
    ],
    contextVariants: [
      {
        lifeStage: 'student',
        questionText: 'You study best when:',
        options: [
          {
            id: 'c4-08-a-s',
            text: 'You have a set study plan and know exactly what to cover and when.',
            functionWeights: { Si: 1.5, Te: 0.5 },
          },
          {
            id: 'c4-08-b-s',
            text: 'You can jump between subjects and follow whatever grabs your interest.',
            functionWeights: { Ne: 1.5, Ti: 0.5 },
          },
        ],
      },
      {
        lifeStage: 'early-career',
        questionText: 'You do your best work when:',
        options: [
          {
            id: 'c4-08-a-e',
            text: 'You have a clear task list and know exactly what to focus on next.',
            functionWeights: { Si: 1.5, Te: 0.5 },
          },
          {
            id: 'c4-08-b-e',
            text: 'You have room to explore ideas and pivot to whatever seems most promising.',
            functionWeights: { Ne: 1.5, Ti: 0.5 },
          },
        ],
      },
      {
        lifeStage: 'mid-career',
        questionText: 'You\'re most effective when:',
        options: [
          {
            id: 'c4-08-a-m',
            text: 'You have clear priorities and an established workflow to follow.',
            functionWeights: { Si: 1.5, Te: 0.5 },
          },
          {
            id: 'c4-08-b-m',
            text: 'You have the autonomy to explore new approaches and chase the most promising leads.',
            functionWeights: { Ne: 1.5, Ti: 0.5 },
          },
        ],
      },
    ],
    chunk: 4,
    weight: 0.85,
  },

  // Q39: Observation style
  {
    id: 'c4-09',
    primaryAxis: ['Ni', 'Se'],
    category: 'information-processing',
    text: 'When you walk into a new place, the first thing you notice is:',
    options: [
      {
        id: 'c4-09-a',
        text: 'The vibe beneath the surface — who\'s in charge, what tensions exist, what\'s really going on.',
        functionWeights: { Ni: 2 },
      },
      {
        id: 'c4-09-b',
        text: 'The physical details — colors, sounds, how the space is laid out, who\'s where, what\'s happening.',
        functionWeights: { Se: 2 },
      },
    ],
    chunk: 4,
    weight: 1.0,
  },

  // Q40: Identity anchor (final differentiator)
  {
    id: 'c4-10',
    primaryAxis: ['Fi', 'Fe'],
    category: 'inner-world',
    text: 'What makes you feel most like "you":',
    options: [
      {
        id: 'c4-10-a',
        text: 'Your personal values, tastes, and beliefs — who you are comes from inside you.',
        functionWeights: { Fi: 2 },
      },
      {
        id: 'c4-10-b',
        text: 'Your relationships, roles, and how you affect others — who you are is shaped by your connections.',
        functionWeights: { Fe: 2 },
      },
    ],
    chunk: 4,
    weight: 1.1,
  },
];

export function getQuestionsByChunk(chunk: number): Question[] {
  return CORE_QUESTIONS.filter(q => q.chunk === chunk);
}

export function getQuestionById(id: string): Question | undefined {
  return CORE_QUESTIONS.find(q => q.id === id);
}
