import { describe, expect, it } from 'vitest'

import { questionnaireConfig } from '@/data/questionsData'
import type { Answers, Question } from '@/types/questionnaire'
import { getNextQuestionId } from '@/utils/questionEngine'

const questionsById = new Map(
  questionnaireConfig.questions.map((question) => [question.id, question]),
)

function q(id: string): Question {
  const question = questionsById.get(id)
  if (!question) {
    throw new Error(`Unknown question: ${id}`)
  }
  return question
}

function nextFor(id: string, answers: Answers = {}): string | null {
  return getNextQuestionId(q(id), answers, questionnaireConfig.questions)
}

describe('getNextQuestionId — real questionnaire flow', () => {
  it('follows the option-level redirect for laptop', () => {
    expect(nextFor('category', { category: 'laptop' })).toBe('laptop_use')
  })

  it('follows the option-level redirect for headphones', () => {
    expect(nextFor('category', { category: 'headphones' })).toBe(
      'headphones_type',
    )
  })

  it('falls back to `next` when the option has no redirect', () => {
    expect(nextFor('category', { category: 'smartphone' })).toBe('budget')
    expect(nextFor('category', { category: 'other' })).toBe('budget')
  })

  it('uses the fallback `next` when the question is unanswered', () => {
    expect(nextFor('category')).toBe('budget')
  })

  it('routes premium budgets through the gte rule', () => {
    expect(nextFor('budget', { budget: 1500 })).toBe('brand_premium')
    expect(nextFor('budget', { budget: 9999 })).toBe('brand_premium')
  })

  it('routes lower budgets through the lt rule', () => {
    expect(nextFor('budget', { budget: 1499 })).toBe('brand_midrange')
    expect(nextFor('budget', { budget: 0 })).toBe('brand_midrange')
  })

  it('handles numeric answers typed as strings', () => {
    expect(nextFor('budget', { budget: '1500' })).toBe('brand_premium')
    expect(nextFor('budget', { budget: '1499' })).toBe('brand_midrange')
  })

  it('routes through the array contains rule for gaming', () => {
    expect(nextFor('features', { features: ['gaming'] })).toBe('gaming_detail')
    expect(nextFor('features', { features: ['battery', 'gaming'] })).toBe(
      'gaming_detail',
    )
  })

  it('ignores the contains rule when gaming is not selected', () => {
    expect(nextFor('features', { features: ['camera', 'battery'] })).toBe(
      'color',
    )
  })

  it('returns null for the terminal question', () => {
    expect(nextFor('contact', { contact: 'a@b.com' })).toBeNull()
  })

  it('routes only the first matching rule', () => {
    const ruleQuestion = q('budget')
    const result = getNextQuestionId(ruleQuestion, { budget: 1600 }, [
      ...questionnaireConfig.questions,
      // An extra later rule that would also match must not win.
      {
        ...ruleQuestion,
        rules: [
          ...(ruleQuestion.rules ?? []),
          { operator: 'gte', value: 1000, nextQuestionId: 'laptop_use' },
        ],
      },
    ])
    expect(result).toBe('brand_premium')
  })
})

describe('getNextQuestionId — rule operators', () => {
  const withRules = (
    rules: Question['rules'],
    fallback = 'fallback',
  ): Question => ({
    id: 'n',
    type: 'text',
    title: 'N',
    rules,
    next: fallback,
  })

  const next = (question: Question, answers: Answers): string | null =>
    getNextQuestionId(question, answers, [question])

  it('equals matches strings and coerced numbers', () => {
    const question = withRules([
      { operator: 'equals', value: 'abc', nextQuestionId: 'a' },
      { operator: 'equals', value: 42, nextQuestionId: 'b' },
    ])
    expect(next(question, { n: 'abc' })).toBe('a')
    expect(next(question, { n: 42 })).toBe('b')
    expect(next(question, { n: '42' })).toBe('b')
    expect(next(question, { n: 'zzz' })).toBe('fallback')
  })

  it('equals compares arrays as unordered sets', () => {
    const question = withRules([
      { operator: 'equals', value: ['a', 'b'], nextQuestionId: 'matched' },
    ])
    expect(next(question, { n: ['b', 'a'] })).toBe('matched')
    expect(next(question, { n: ['a', 'c'] })).toBe('fallback')
  })

  it('notEquals is the inverse of equals', () => {
    const question = withRules([
      { operator: 'notEquals', value: 'skip', nextQuestionId: 'other' },
    ])
    expect(next(question, { n: 'keep' })).toBe('other')
    expect(next(question, { n: 'skip' })).toBe('fallback')
  })

  it('contains matches substrings in strings', () => {
    const question = withRules([
      { operator: 'contains', value: 'world', nextQuestionId: 'hit' },
    ])
    expect(next(question, { n: 'hello world' })).toBe('hit')
    expect(next(question, { n: 'hello there' })).toBe('fallback')
  })

  it('contains matches any item in arrays', () => {
    const question = withRules([
      { operator: 'contains', value: ['x', 'gaming'], nextQuestionId: 'hit' },
    ])
    expect(next(question, { n: ['a', 'gaming'] })).toBe('hit')
    expect(next(question, { n: ['a', 'b'] })).toBe('fallback')
  })

  it('notContains rejects matches', () => {
    const question = withRules([
      { operator: 'notContains', value: 'blocked', nextQuestionId: 'ok' },
    ])
    expect(next(question, { n: 'all clear' })).toBe('ok')
    expect(next(question, { n: 'blocked here' })).toBe('fallback')
  })

  it('in matches scalars against a value list', () => {
    const question = withRules([
      { operator: 'in', value: ['red', 'blue'], nextQuestionId: 'colorful' },
    ])
    expect(next(question, { n: 'blue' })).toBe('colorful')
    expect(next(question, { n: 'green' })).toBe('fallback')
  })

  it('in matches arrays against a value list', () => {
    const question = withRules([
      { operator: 'in', value: ['p', 'q'], nextQuestionId: 'hit' },
    ])
    expect(next(question, { n: ['r', 'p'] })).toBe('hit')
    expect(next(question, { n: ['r', 's'] })).toBe('fallback')
  })

  it.each([
    ['greaterThan', 6, 5, 'hit'],
    ['lessThan', 4, 5, 'hit'],
    ['gte', 5, 5, 'hit'],
    ['lte', 5, 5, 'hit'],
    ['gt', 5, 5, 'fallback'],
    ['lt', 5, 5, 'fallback'],
  ] as const)('%s: %s vs %s', (operator, answer, value, expected) => {
    const question = withRules([{ operator, value, nextQuestionId: 'hit' }])
    expect(next(question, { n: answer })).toBe(expected)
  })

  it('numeric comparisons reject non-numeric answers', () => {
    const question = withRules([
      { operator: 'gt', value: 5, nextQuestionId: 'hit' },
    ])
    expect(next(question, { n: 'abc' })).toBe('fallback')
    expect(next(question, { n: '' })).toBe('fallback')
  })

  it('does not trigger any rule when the answer is missing', () => {
    const question = withRules([
      { operator: 'equals', value: 'x', nextQuestionId: 'hit' },
    ])
    expect(next(question, {})).toBe('fallback')
  })

  it('evaluates rules against another question via questionId', () => {
    const q1: Question = {
      id: 'q1',
      type: 'text',
      title: 'A',
      rules: [
        {
          questionId: 'q2',
          operator: 'equals',
          value: 'skip',
          nextQuestionId: 'final',
        },
      ],
      next: 'q2',
    }
    const q2: Question = { id: 'q2', type: 'text', title: 'B', next: null }
    const final: Question = {
      id: 'final',
      type: 'text',
      title: 'Final',
      next: null,
    }

    expect(getNextQuestionId(q1, { q2: 'skip' }, [q1, q2, final])).toBe('final')
    expect(getNextQuestionId(q1, { q2: 'keep' }, [q1, q2, final])).toBe('q2')
  })

  it('skips rules whose referenced question does not exist', () => {
    const question: Question = {
      id: 'q1',
      type: 'text',
      title: 'A',
      rules: [
        {
          questionId: 'ghost',
          operator: 'equals',
          value: 'x',
          nextQuestionId: 'elsewhere',
        },
      ],
      next: 'q3',
    }
    expect(getNextQuestionId(question, { ghost: 'x' }, [question])).toBe('q3')
  })

  it('prefers the option redirect over question rules', () => {
    const question: Question = {
      id: 'o',
      type: 'single',
      title: 'O',
      options: [{ id: 'a', label: 'A', nextQuestionId: 'redirected' }],
      rules: [{ operator: 'equals', value: 'a', nextQuestionId: 'via_rule' }],
      next: 'fallback',
    }
    expect(getNextQuestionId(question, { o: 'a' }, [question])).toBe(
      'redirected',
    )
  })

  it('honours an explicit null option redirect (end of flow)', () => {
    const question: Question = {
      id: 'o',
      type: 'single',
      title: 'O',
      options: [{ id: 'a', label: 'A', nextQuestionId: null }],
    }
    expect(getNextQuestionId(question, { o: 'a' }, [question])).toBeNull()
  })

  it('honours an explicit null rule redirect (end of flow)', () => {
    const question: Question = {
      id: 'o',
      type: 'single',
      title: 'O',
      rules: [{ operator: 'equals', value: 'a', nextQuestionId: null }],
      next: 'fallback',
    }
    expect(getNextQuestionId(question, { o: 'a' }, [question])).toBeNull()
  })

  it('returns null when a question has no next and no matching rules', () => {
    const question: Question = { id: 'leaf', type: 'text', title: 'Leaf' }
    expect(getNextQuestionId(question, { leaf: 'x' }, [question])).toBeNull()
  })
})
