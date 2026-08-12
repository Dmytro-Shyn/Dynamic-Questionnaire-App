import { describe, expect, it } from 'vitest'

import type { Question } from '@/types/questionnaire'
import { validateAnswer } from '@/utils/validation'

const base = (overrides: Partial<Question>): Question => ({
  id: 'q',
  type: 'text',
  title: 'Q',
  ...overrides,
})

describe('validateAnswer', () => {
  it('accepts any answer when no validation is defined', () => {
    const question = base({})
    expect(validateAnswer(question, undefined)).toBeNull()
    expect(validateAnswer(question, 'anything')).toBeNull()
  })

  it('flags missing answers as required', () => {
    const question = base({ validation: { required: true } })
    expect(validateAnswer(question, undefined)).toBe('This field is required.')
    expect(validateAnswer(question, '')).toBe('This field is required.')
    expect(validateAnswer(question, 'value')).toBeNull()
  })

  it('requires at least one selection for multiple choice', () => {
    const question = base({
      type: 'multiple',
      validation: { required: true },
    })
    expect(validateAnswer(question, [])).toBe('This field is required.')
    expect(validateAnswer(question, ['a'])).toBeNull()
  })

  it('enforces text length constraints', () => {
    const question = base({
      validation: { minLength: 3, maxLength: 5 },
    })
    expect(validateAnswer(question, 'ab')).toBe(
      'Please enter at least 3 characters.',
    )
    expect(validateAnswer(question, 'abcdef')).toBe(
      'Please enter at most 5 characters.',
    )
    expect(validateAnswer(question, 'abc')).toBeNull()
  })

  it('validates text against a pattern', () => {
    const question = base({
      validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    })
    expect(validateAnswer(question, 'not-an-email')).toBe(
      'The format is invalid.',
    )
    expect(validateAnswer(question, 'a@b.com')).toBeNull()
  })

  it('enforces numeric range constraints', () => {
    const question = base({
      type: 'number',
      validation: { min: 0, max: 100 },
    })
    expect(validateAnswer(question, -1)).toBe('Minimum value is 0.')
    expect(validateAnswer(question, 101)).toBe('Maximum value is 100.')
    expect(validateAnswer(question, 50)).toBeNull()
  })
})
