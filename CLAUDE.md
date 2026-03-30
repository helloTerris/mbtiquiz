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

This is a **client-side MBTI cognitive function typing app** built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Zustand. No backend — all data stays in the browser via localStorage. One API route exists for AI-powered question personalization via the Anthropic SDK.

### Quiz Flow

`/quiz/context` → `/quiz/test` → `/quiz/refine` (if needed) → `/quiz/results`

Phases: **idle → context → test → refine → results**. Each phase is a page under `src/app/quiz/`. There is also a multi-person `/consensus` mode.

### Core Layers

- **`src/types/`** — TypeScript definitions for 8 Jungian cognitive functions (Ti/Te/Fi/Fe/Ni/Ne/Si/Se), questions, scoring, stacks, results, consensus, AI personalization
- **`src/engine/`** — Pure business logic, no UI dependencies
- **`src/stores/`** — Zustand stores with `persist` middleware (quiz, context, results, consensus). `ai-questions-store` is NOT persisted (in-memory only, lost on refresh)
- **`src/components/`** — UI split into `ui/` (reusable), `quiz/`, `results/`, `consensus/`, `live/`
- **`src/hooks/`** — `useHydration()` prevents SSR/client mismatch on persisted stores; `usePersonalizedQuestions()` merges AI-personalized text + extra options onto base questions
- **`src/lib/`** — `cn()` utility (clsx + tailwind-merge), global constants, `personalize.ts` (AI fetch helpers + merge logic)

### Scoring Pipeline (the heart of the app)

The engine processes answers through a multi-stage pipeline:

1. **Score Accumulation** (`engine/scoring/score-accumulator.ts`) — Uses `question.options.find(o => o.id === answer.selectedOptionId)` to locate the selected option's `functionWeights`, then applies question weight, response-time modifiers (fast <3s = 1.1x, slow >10s = 0.9x), intensity multiplier (0.5x/1.0x/1.5x), and 8 context-based modifiers (capped at 0.85 combined)
2. **Normalization** (`engine/scoring/normalizer.ts`) — Pair normalization (each opposition pair scales to 0-100 relative preference) then global normalization (all 8 functions relative to highest)
3. **Stack Matching** (`engine/stacks/stack-validator.ts`) — Fits scores against all 16 valid MBTI stacks using rank-distance with quadratic penalty, position weights (dom=40, aux=30, tert=15, inf=15), and bonuses for axis consistency/attitude alternation
4. **Stack Ranking** (`engine/stacks/stack-ranker.ts`) — Sorts by fit score, derives confidence from margin between #1 and #2 types
5. **Confidence** (`engine/scoring/confidence-calculator.ts`) — Composite of margin-of-victory (40%), consistency (30%), response-time variance (15%), polarization (15%)
6. **Result Generation** (`engine/results/result-generator.ts`) — Orchestrates scoring + contradiction detection + explanation generation + stress profiling + true-self analysis + bias detection

### Question System

- **40 core forced-choice questions** in 4 chunks of 10 (`engine/questions/question-bank.ts`)
- **6 adaptive questions** triggered when function pairs are too close (`engine/questions/adaptive-questions.ts`)
- **2 stress questions** for inferior function detection (`engine/questions/stress-questions.ts`)
- Questions support **variable-length options** — `Question.options: ChoiceOption[]` (base questions have 2, but "More options" can append extras with the same `functionWeights`)
- Questions include **redundancy pairs** (same axis, different context) for contradiction detection
- Questions have **context variants** that adapt wording based on user life stage
- Categories: decision-making, information-processing, social-interaction, stress-response, work-style, inner-world, default-vs-forced

### AI Personalization Layer

The app rewrites question text via Claude Sonnet to match the user's life context (job, hobbies, living situation). This is the only server-side code.

**Flow:** Context form collects user info → all 4 chunks fetched in parallel from `/api/personalize-questions` → AI-rewritten text stored in `ai-questions-store` → `usePersonalizedQuestions` hook merges AI text onto base questions (preserving `functionWeights`)

**Key files:**
- `src/app/api/personalize-questions/route.ts` — POST route handler, calls Anthropic API with prompt caching, validates AI response structure/IDs
- `src/lib/personalize.ts` — `stripQuestionsForAI()` removes `functionWeights` before sending; `mergePersonalized()` overlays AI text back; `buildExtraOptions()` creates additional options with copied weights; `fetchRefreshedQuestion()` fetches a single question with `previousVersions` for dedup
- `src/stores/ai-questions-store.ts` — `personalizedChunks` (chunk → AI output), `extraOptions` (questionId → additional `ChoiceOption[]`), `refreshingQuestionIds`, `refreshHistory`
- `src/hooks/usePersonalizedQuestions.ts` — Fallback chain: AI personalized → static contextVariants → base questions. Appends `extraOptions` after merge.

**"More options" feature:** Users can generate additional option pairs (C/D, E/F) per question. The AI returns 2 new option texts; `buildExtraOptions()` creates `ChoiceOption` objects with new IDs (`-gen1`, `-gen2`) and `functionWeights` copied from the base question's original options. Scoring works because `accumulateScore` uses `.find()` — no 2-option assumption in the engine.

**Prompt design:** The system prompt uses category-aware context selection — work-style/decision-making questions use work context, while inner-world/default-vs-forced/social-interaction questions use personal/off-duty context (hobbies, home life) to avoid testing the work persona instead of natural cognitive wiring.

### Key Constants (`src/lib/constants.ts`)

`QUESTIONS_PER_CHUNK = 10`, `TOTAL_CHUNKS = 4`, `AMBIGUITY_THRESHOLD = 12`, `MAX_ADAPTIVE_QUESTIONS = 5`

### UI

Glass morphism dark theme with purple/cyan gradient accents. Custom CSS variables in `globals.css` with per-function colors (Ti=indigo, Te=violet, Fi=pink, Fe=rose, Ni=cyan, Ne=teal, Si=amber, Se=orange). Animations via `motion` (Framer Motion). Path alias: `@/*` → `src/*`.

### Important Patterns

- **AI types stay as tuples** (`PersonalizedQuestionOutput.options: [{id,text},{id,text}]`) — the AI always returns exactly 2 options. Only `Question.options` is `ChoiceOption[]` to support extra options.
- **Zustand stores accessed outside React** via `useStore.getState()` for imperative calls (fetch callbacks, store-to-store reads).
- **Context store versioned migrations** — bump `version` and add a migration block when adding fields to `UserContext`.
- **`AbortSignal.timeout(30_000)`** used for all AI fetch calls. Timeout/abort errors logged as `console.warn`, not `console.error`, to avoid triggering the Next.js error overlay.
