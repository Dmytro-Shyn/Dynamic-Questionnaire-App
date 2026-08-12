# AGENTS.md

Guidance for AI coding assistants working on this repository.

## Commands

Always keep these green after changes:

```bash
npm run lint         # ESLint
npm run test         # Vitest
npm run build        # tsc -b && vite build
npm run format:check # Prettier
```

Run `npm run format` before finishing a change if `format:check` fails.

## Conventions

- Path alias: `@/*` resolves to `src/*` (configured in `vite.config.ts` and
  `tsconfig.app.json`).
- Type-only imports must use `import type` (`verbatimModuleSyntax` is on).
- Do not add comments unless they explain non-obvious domain logic (see
  `src/types/questionnaire.ts` and `src/utils/questionEngine.ts`).
- Keep the navigation engine (`src/utils/questionEngine.ts`) free of React and
  Redux imports — it is a pure function.
- The questionnaire is data, not code. Add questions/branching in
  `src/data/questionsData.ts`, never hard-code flow in components.
- UI components live in `src/components/questionnaire/`, shadcn primitives in
  `src/components/ui/`.
- The config schema has a JSON Schema mirror at
  `src/schema/questionnaire.schema.json` — keep it in sync with
  `src/types/questionnaire.ts`.

## Core invariants

1. `getNextQuestionId(currentQuestion, answers, allQuestions)` is the single
   place that decides the next question. Resolution order:
   option redirect → rules (first match wins) → `Question.next` → `null`.
2. `setAnswer` with `undefined` clears the answer; going Back clears the answer
   of the question being left.
3. Unanswered questions never trigger rules.
4. Algolia defaults to a public demo index; production credentials go in a
   `.env` file (`VITE_ALGOLIA_*`), never hard-coded.
