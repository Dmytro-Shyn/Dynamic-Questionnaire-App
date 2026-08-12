import type {
  Answers,
  AnswerValue,
  ConditionalRule,
  Question,
} from '@/types/questionnaire'

/**
 * Pure navigation engine. Given the current question, the stored answers and
 * the full question list it resolves the next question id.
 *
 * Resolution order (first match wins):
 *  1. Option-level redirect  (`Option.nextQuestionId` for the selected choice)
 *  2. Question-level rules   (first `ConditionalRule` whose condition matches)
 *  3. Fallback `Question.next`
 *
 * Returns `null` when the questionnaire is finished.
 */

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function setsEqual(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((item) => b.includes(item))
}

function looseEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return setsEqual(a, b)
  }
  return String(a) === String(b)
}

function containsValue(answer: AnswerValue, value: string | number): boolean {
  if (Array.isArray(answer)) {
    return answer.some((item) => looseEqual(item, value))
  }
  if (typeof answer === 'string' && typeof value === 'string') {
    return answer.includes(value)
  }
  return looseEqual(answer, value)
}

function matchesRule(
  rule: ConditionalRule,
  answer: AnswerValue | undefined,
): boolean {
  const { operator, value } = rule

  // No answer ever triggers a redirect.
  if (answer === undefined) {
    return false
  }

  switch (operator) {
    case 'equals':
      return looseEqual(answer, value)
    case 'notEquals':
      return !looseEqual(answer, value)
    case 'contains': {
      const list = Array.isArray(value) ? value : [value]
      return list.some((item) => containsValue(answer, item))
    }
    case 'notContains': {
      const list = Array.isArray(value) ? value : [value]
      return !list.some((item) => containsValue(answer, item))
    }
    case 'in': {
      const list = Array.isArray(value) ? value : [value]
      if (Array.isArray(answer)) {
        return answer.some((item) =>
          list.some((entry) => looseEqual(item, entry)),
        )
      }
      return list.some((entry) => looseEqual(answer, entry))
    }
    case 'greaterThan':
    case 'gt': {
      const left = toNumber(answer)
      const right = toNumber(value)
      return left !== null && right !== null && left > right
    }
    case 'lessThan':
    case 'lt': {
      const left = toNumber(answer)
      const right = toNumber(value)
      return left !== null && right !== null && left < right
    }
    case 'gte': {
      const left = toNumber(answer)
      const right = toNumber(value)
      return left !== null && right !== null && left >= right
    }
    case 'lte': {
      const left = toNumber(answer)
      const right = toNumber(value)
      return left !== null && right !== null && left <= right
    }
  }
}

/**
 * Returns the option-level redirect for the current answer:
 *  - a question id or `null` (end) when a matched option declares one,
 *  - `undefined` when no matched option has a redirect.
 */
function resolveOptionRedirect(
  question: Question,
  answer: AnswerValue | undefined,
): string | null | undefined {
  if (!question.options || answer === undefined) {
    return undefined
  }

  const matched = Array.isArray(answer)
    ? question.options.filter((option) => answer.includes(option.id))
    : question.options.find((option) => option.id === answer)

  if (!matched) {
    return undefined
  }

  const candidates = Array.isArray(matched) ? matched : [matched]
  const redirecting = candidates.find(
    (option) => option.nextQuestionId !== undefined,
  )
  return redirecting ? (redirecting.nextQuestionId ?? null) : undefined
}

function resolveRuleRedirect(
  question: Question,
  answers: Answers,
  questionsById: Map<string, Question>,
): string | null | undefined {
  if (!question.rules) {
    return undefined
  }

  for (const rule of question.rules) {
    const source = rule.questionId
      ? questionsById.get(rule.questionId)
      : question
    if (!source) {
      continue
    }
    if (matchesRule(rule, answers[source.id])) {
      return rule.nextQuestionId
    }
  }
  return undefined
}

export function getNextQuestionId(
  currentQuestion: Question,
  answers: Answers,
  allQuestions: Question[],
): string | null {
  const questionsById = new Map(
    allQuestions.map((question) => [question.id, question]),
  )

  const optionRedirect = resolveOptionRedirect(
    currentQuestion,
    answers[currentQuestion.id],
  )
  if (optionRedirect !== undefined) {
    return optionRedirect
  }

  const ruleRedirect = resolveRuleRedirect(
    currentQuestion,
    answers,
    questionsById,
  )
  if (ruleRedirect !== undefined) {
    return ruleRedirect
  }

  const fallback = currentQuestion.next
  return fallback !== undefined ? fallback : null
}
