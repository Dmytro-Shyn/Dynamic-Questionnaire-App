# Dynamic Questionnaire App

A config-driven questionnaire with **dynamic branching** built in React + TypeScript.
The next question is chosen based on the user's previous answers, and the final
screen shows relevant results fetched from **Algolia**.

Built as a junior frontend test task.

## Features

- Four question types: **single choice**, **multiple choice**, **text**, **number**
- **Dynamic flow**: the next question is resolved from the user's answers via
  option redirects and conditional rules
- **Config-driven**: the whole questionnaire lives in one typed data file — no
  UI changes needed to add questions or branching
- **State management** with Redux Toolkit (answers, navigation history, completion)
- **Algolia results** screen (loading spinner, error/empty states, result grid)
- **UX**: progress bar, validation messages, smooth step transitions, keyboard
  support (Enter submits)

## Tech stack

| Layer   | Tooling                                      |
| ------- | -------------------------------------------- |
| Build   | Vite + React 19 + TypeScript                 |
| State   | Redux Toolkit, react-redux                   |
| Styling | TailwindCSS v4, shadcn/ui (Radix primitives) |
| Search  | algoliasearch (public demo index)            |
| Quality | ESLint, Prettier, Vitest                     |

## Getting started

Requirements: **Node 20.19+** (tested on Node 22).

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Optional environment variables

Algolia defaults to Algolia's public demo index and works out of the box. To use
your own index, create a `.env` file in the project root:

```
VITE_ALGOLIA_APP_ID=your-app-id
VITE_ALGOLIA_API_KEY=your-search-only-key
VITE_ALGOLIA_INDEX_NAME=your-index
```

### Scripts

| Script                 | Description                       |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start the Vite dev server         |
| `npm run build`        | Type-check (`tsc -b`) and build   |
| `npm run preview`      | Preview the production build      |
| `npm run lint`         | Run ESLint                        |
| `npm run test`         | Run Vitest tests once             |
| `npm run format`       | Format all files with Prettier    |
| `npm run format:check` | Verify formatting without writing |

## Project structure

```
src/
├── components/
│   ├── questionnaire/        # Question UI (one component per question type)
│   │   ├── QuestionCard.tsx  # Wrapper: title, description, validation, nav buttons
│   │   ├── SingleChoice.tsx  # RadioGroup
│   │   ├── MultipleChoice.tsx# Checkbox
│   │   ├── TextInput.tsx     # shadcn Input
│   │   └── NumberInput.tsx   # Numeric input with validation
│   ├── ResultsView.tsx       # Algolia results screen
│   └── ui/                   # shadcn/ui primitives (Button, Card, Input, ...)
├── data/
│   └── questionsData.ts      # The questionnaire configuration (single source of truth)
├── schema/
│   └── questionnaire.schema.json  # JSON Schema mirroring the TS types
├── services/
│   └── algoliaService.ts     # Algolia client + fetchAlgoliaResults
├── store/
│   ├── questionnaireSlice.ts # Redux state: current question, answers, history
│   ├── selectors.ts          # Typed selectors
│   ├── hooks.ts              # Typed useAppDispatch / useAppSelector
│   └── index.ts              # Store configuration
├── types/
│   └── questionnaire.ts      # Domain model (Question, ConditionalRule, ...)
└── utils/
    ├── questionEngine.ts     # Pure navigation logic (getNextQuestionId)
    ├── validation.ts         # validateAnswer
    └── algoliaQuery.ts       # answers -> Algolia query/filters
```

## Architecture & approach

### Config-driven questionnaire

There is **no per-question UI code**. `src/data/questionsData.ts` is a typed
`QuestionnaireConfig` (checked with `satisfies`). The UI renders whatever the
config describes, and `src/utils/questionEngine.ts` walks it. Adding a question
is just adding an entry to the array.

Each product category (smartphone, laptop, headphones, other) follows its **own
independent branch** with category-specific questions — budget, brand and
feature questions are answered per branch, so a headphones user is never asked
about cameras. The branches only share the final `contact` (email capture) step.

Branch overview:

```
category
├── smartphone ─ os ─> features ─contains gaming─> gaming_detail ─> budget ─> brand ─> contact
├── laptop ─ use ─(gaming)─> gpu ─> features ─> budget ─> brand ─> contact
├── headphones ─ type ─> features ─contains nc─> anc_priority ─> budget ─> brand ─> contact
└── other ─> budget ─> contact
```

### How the next question is resolved

`getNextQuestionId(currentQuestion, answers, allQuestions)` in
`src/utils/questionEngine.ts` returns the next question id or `null` (end).
Resolution order — **first match wins**:

1. **Option redirect** — the selected `Option` declares `nextQuestionId`.
2. **Conditional rules** — the first `ConditionalRule` whose condition matches.
3. **Fallback** — `Question.next`.

Rules can inspect the current question or any other question via
`rule.questionId`. Rule conditions support the operators:
`equals`, `notEquals`, `contains`, `notContains`, `in`,
`greaterThan`, `lessThan`, `gte`, `lte`, `gt`, `lt`.

### State

`src/store/questionnaireSlice.ts` keeps:

- `currentQuestionId` — where the user is (`null` when finished)
- `answers` — `Record<questionId, AnswerValue>`
- `history` — ids of previously visited questions, enabling **Back**
- `isCompleted` — finished flag

Going **Next** computes the following question with the engine and pushes the
current one onto `history`. Going **Back** pops `history` and clears the answer
of the question being left, so the path is re-evaluated cleanly.

### Results

On completion, `src/utils/algoliaQuery.ts` translates the answers into an
Algolia query (keywords) and filters (`brand:...`, `price < N`), then
`src/components/ResultsView.tsx` fetches and renders hits.

## Extending the project

### Add a question

Edit `src/data/questionsData.ts` and add an object:

```ts
{
  id: 'storage',
  type: 'single',
  title: 'How much storage?',
  options: [
    { id: '256', label: '256 GB' },
    { id: '512', label: '512 GB', nextQuestionId: 'accessories' }, // direct jump
  ],
  next: 'contact',
  validation: { required: true },
}
```

Point some existing question's `next` (or a rule's `nextQuestionId`) at it.

### Add branching

```ts
{
  id: 'budget',
  type: 'number',
  rules: [
    { operator: 'gte', value: 1500, nextQuestionId: 'premium' },
    { questionId: 'budget', operator: 'lt', value: 1500, nextQuestionId: 'midrange' },
  ],
}
```

`questionId` is optional and defaults to the question the rule belongs to.

### Add a new operator

1. Extend `ComparisonOperator` in `src/types/questionnaire.ts` (and the JSON Schema).
2. Handle it in the `matchesRule` switch in `src/utils/questionEngine.ts`.
3. Add a test case in `src/utils/questionEngine.test.ts`.

### Add a new question type

1. Extend `QuestionType` and any props in `src/types/questionnaire.ts`.
2. Add a render branch in `QuestionCard.tsx` (`switch` on `question.type`).
3. Extend validation in `src/utils/validation.ts` if needed.

### Switch the Algolia index

Set the `VITE_ALGOLIA_*` environment variables, or edit the defaults in
`src/services/algoliaService.ts`. Map more answers in `buildAlgoliaQuery`
(`src/utils/algoliaQuery.ts`) as needed.

## Assumptions

- A questionnaire has a single starting question (`firstQuestionId`).
- Rules without `questionId` inspect the question they are attached to.
- Unanswered questions never trigger a rule (they fall through to `next`).
- Going Back clears the answer of the question you are leaving.
- Storing the "email" answer has no side effects; it is kept only to demo the
  text question type.
- Algolia credentials are search-only demo credentials; replacing them is enough
  to go to production.

## Testing

53 unit tests cover the navigation engine, validation, the Algolia query
builder and the Redux flow. Run `npm run test`.

## AI-friendly notes

See [AGENTS.md](./AGENTS.md) for machine-readable guidance for AI coding tools.

- **Commands**: `npm run lint`, `npm run test`, `npm run build`,
  `npm run format:check` must stay green after every change.
- **Conventions**: path alias `@/*` → `src/*`; use `import type` for type-only
  imports (`verbatimModuleSyntax`); no code comments unless they explain
  non-obvious domain logic; Prettier/ESLint configs define the style.
- **Core invariants**: the engine in `src/utils/questionEngine.ts` is pure —
  keep it free of React/Redux imports; the questionnaire is data, not code —
  keep branching in the config and the engine, not in components.
