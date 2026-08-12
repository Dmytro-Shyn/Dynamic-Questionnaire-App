/**
 * Domain model for the questionnaire.
 *
 * A questionnaire is a directed graph of questions. Every question either:
 *  - declares a fallback `next` question,
 *  - declares `rules` that redirect based on the user's answers, or
 *  - is a terminal question (`next: null`) that completes the questionnaire.
 *
 * Option-level branching is supported too: an `Option` may override the next
 * question directly, which is evaluated before question-level rules.
 */

export type QuestionType = 'single' | 'multiple' | 'text' | 'number'

/** The runtime shape of a stored answer. */
export type AnswerValue = string | number | string[]

/** A single answer set keyed by question id. */
export type Answers = Record<string, AnswerValue>

/** One selectable choice for `single` / `multiple` questions. */
export interface Option {
  id: string
  label: string
  description?: string
  /**
   * Direct redirect used when this option is selected.
   * `null` ends the questionnaire; omitted falls back to question-level rules.
   */
  nextQuestionId?: string | null
}

export type ComparisonOperator =
  | 'equals'
  | 'notEquals'
  /** String contains a substring, or array contains the value. */
  | 'contains'
  | 'notContains'
  /** The answer matches any value from the rule's list. */
  | 'in'
  | 'greaterThan'
  | 'lessThan'
  | 'gte'
  | 'lte'
  | 'gt'
  | 'lt'

export interface ConditionalRule {
  /**
   * The question whose answer is inspected. Defaults to the question the rule
   * is attached to, which keeps rule definitions terse for the common case.
   */
  questionId?: string
  operator: ComparisonOperator
  value: string | number | Array<string | number>
  /** `null` ends the questionnaire. */
  nextQuestionId: string | null
}

export interface QuestionValidation {
  required?: boolean
  /** text: minimum / maximum length. */
  minLength?: number
  maxLength?: number
  /** number: allowed range. */
  min?: number
  max?: number
  /** text: regex pattern the answer must match. */
  pattern?: string
}

export interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  /** Placeholder text shown in text / number inputs. */
  placeholder?: string
  /** Required for `single` / `multiple`. */
  options?: Option[]
  /**
   * Fallback next question id. `null` completes the questionnaire.
   * Optional when the question is terminal or fully covered by rules.
   */
  next?: string | null
  /** Evaluated in order; the first matching rule decides the next question. */
  rules?: ConditionalRule[]
  validation?: QuestionValidation
}

export interface QuestionnaireConfig {
  id: string
  title: string
  description?: string
  /** Entry point of the flow. */
  firstQuestionId: string
  questions: Question[]
}
