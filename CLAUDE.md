# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test framework is configured yet.

## Architecture

This is a **client-side MBTI cognitive function typing app** built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Zustand. No backend — all data stays in the browser via localStorage.

### Quiz Flow

`/quiz/context` → `/quiz/test` → `/quiz/refine` (if needed) → `/quiz/results`

Phases: **idle → context → test → refine → results**. Each phase is a page under `src/app/quiz/`. There is also a multi-person `/consensus` mode.

### Core Layers

- **`src/types/`** — TypeScript definitions for 8 Jungian cognitive functions (Ti/Te/Fi/Fe/Ni/Ne/Si/Se), questions, scoring, stacks, results, consensus
- **`src/engine/`** — Pure business logic, no UI dependencies
- **`src/stores/`** — Zustand stores with `persist` middleware (quiz, context, results, consensus)
- **`src/components/`** — UI split into `ui/` (reusable), `quiz/`, `results/`, `consensus/`, `live/`
- **`src/hooks/`** — `useHydration()` prevents SSR/client mismatch on persisted stores
- **`src/lib/`** — `cn()` utility (clsx + tailwind-merge), global constants

### Scoring Pipeline (the heart of the app)

The engine processes answers through a multi-stage pipeline:

1. **Score Accumulation** (`engine/scoring/score-accumulator.ts`) — Maps answers to function weights, applies question weight multipliers and response-time modifiers (fast <3s = 1.1x boost, slow >10s = 0.9x)
2. **Normalization** (`engine/scoring/normalizer.ts`) — Pair normalization (each opposition pair scales to 0-100 relative preference) then global normalization (all 8 functions relative to highest)
3. **Stack Matching** (`engine/stacks/stack-validator.ts`) — Fits scores against all 16 valid MBTI stacks using rank-distance with quadratic penalty, position weights (dom=40, aux=30, tert=15, inf=15), and bonuses for axis consistency/attitude alternation
4. **Stack Ranking** (`engine/stacks/stack-ranker.ts`) — Sorts by fit score, derives confidence from margin between #1 and #2 types
5. **Confidence** (`engine/scoring/confidence-calculator.ts`) — Composite of margin-of-victory (40%), consistency (30%), response-time variance (15%), polarization (15%)
6. **Result Generation** (`engine/results/result-generator.ts`) — Orchestrates scoring + contradiction detection + explanation generation + stress profiling + true-self analysis + bias detection

### Question System

- **40 core forced-choice questions** in 4 chunks of 10 (`engine/questions/question-bank.ts`)
- **6 adaptive questions** triggered when function pairs are too close (gap < 12 in pair normalization) (`engine/questions/adaptive-questions.ts`)
- **2 stress questions** for inferior function detection (`engine/questions/stress-questions.ts`)
- Questions include **redundancy pairs** (same axis, different context) for contradiction detection
- Questions have **context variants** that adapt wording based on user life stage
- Categories: decision-making, information-processing, social-interaction, stress-response, work-style, inner-world, default-vs-forced

### Key Constants (`src/lib/constants.ts`)

`QUESTIONS_PER_CHUNK = 10`, `TOTAL_CHUNKS = 4`, `AMBIGUITY_THRESHOLD = 12`, `MAX_ADAPTIVE_QUESTIONS = 5`

### UI

Glass morphism dark theme with purple/cyan gradient accents. Custom CSS variables in `globals.css` with per-function colors. Animations via `motion` (Framer Motion). Path alias: `@/*` → `src/*`.
