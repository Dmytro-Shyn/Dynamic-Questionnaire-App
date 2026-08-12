import type { AnswerValue, Question } from '@/types/questionnaire'

export function validateAnswer(
  question: Question,
  answer: AnswerValue | undefined,
): string | null {
  const validation = question.validation
  if (!validation) {
    return null
  }

  const isEmpty =
    answer === undefined ||
    answer === '' ||
    (Array.isArray(answer) && answer.length === 0)

  if (validation.required && isEmpty) {
    return 'This field is required.'
  }

  if (isEmpty) {
    return null
  }

  if (question.type === 'text' && typeof answer === 'string') {
    if (
      validation.minLength !== undefined &&
      answer.length < validation.minLength
    ) {
      return `Please enter at least ${validation.minLength} characters.`
    }
    if (
      validation.maxLength !== undefined &&
      answer.length > validation.maxLength
    ) {
      return `Please enter at most ${validation.maxLength} characters.`
    }
    if (validation.pattern && !new RegExp(validation.pattern).test(answer)) {
      return 'The format is invalid.'
    }
  }

  if (question.type === 'number') {
    const numeric = typeof answer === 'number' ? answer : Number(answer)
    if (Number.isFinite(numeric)) {
      if (validation.min !== undefined && numeric < validation.min) {
        return `Minimum value is ${validation.min}.`
      }
      if (validation.max !== undefined && numeric > validation.max) {
        return `Maximum value is ${validation.max}.`
      }
    }
  }

  return null
}
