import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'

import { questionnaireConfig } from '@/data/questionsData'
import questionnaireReducer, {
  goToNextQuestion,
  goToPreviousQuestion,
  resetQuestionnaire,
  setAnswer,
} from '@/store/questionnaireSlice'

function createStore() {
  return configureStore({
    reducer: { questionnaire: questionnaireReducer },
  })
}

const select = (store: ReturnType<typeof createStore>) =>
  store.getState().questionnaire

describe('questionnaireSlice', () => {
  it('walks the smartphone flow to completion', () => {
    const store = createStore()
    const dispatch = store.dispatch

    expect(select(store).currentQuestionId).toBe('category')

    dispatch(setAnswer({ questionId: 'category', answer: 'smartphone' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('phone_os')

    dispatch(setAnswer({ questionId: 'phone_os', answer: 'android' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('phone_features')

    dispatch(
      setAnswer({
        questionId: 'phone_features',
        answer: ['camera', 'battery'],
      }),
    )
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('phone_budget')

    dispatch(setAnswer({ questionId: 'phone_budget', answer: 2000 }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('phone_brand_premium')

    dispatch(setAnswer({ questionId: 'phone_brand_premium', answer: 'Apple' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('contact')

    dispatch(setAnswer({ questionId: 'contact', answer: 'a@b.com' }))
    dispatch(goToNextQuestion())
    expect(select(store).isCompleted).toBe(true)
    expect(select(store).currentQuestionId).toBeNull()
  })

  it('branches to the laptop GPU path when gaming is selected', () => {
    const store = createStore()
    const dispatch = store.dispatch

    dispatch(setAnswer({ questionId: 'category', answer: 'laptop' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('laptop_use')

    dispatch(setAnswer({ questionId: 'laptop_use', answer: 'gaming' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('laptop_gpu')
  })

  it('routes headphones through the ANC priority branch', () => {
    const store = createStore()
    const dispatch = store.dispatch

    dispatch(setAnswer({ questionId: 'category', answer: 'headphones' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('headphones_type')

    dispatch(setAnswer({ questionId: 'headphones_type', answer: 'over_ear' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('headphone_features')

    dispatch(
      setAnswer({
        questionId: 'headphone_features',
        answer: ['noise_cancelling'],
      }),
    )
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('anc_priority')
  })

  it('clears the answer of the question left when going back', () => {
    const store = createStore()
    const dispatch = store.dispatch

    dispatch(setAnswer({ questionId: 'category', answer: 'laptop' }))
    dispatch(goToNextQuestion())
    dispatch(setAnswer({ questionId: 'laptop_use', answer: 'gaming' }))
    dispatch(goToNextQuestion())
    dispatch(setAnswer({ questionId: 'laptop_gpu', answer: 'dedicated' }))
    expect(select(store).currentQuestionId).toBe('laptop_gpu')

    dispatch(goToPreviousQuestion())
    expect(select(store).currentQuestionId).toBe('laptop_use')
    expect(select(store).answers.laptop_gpu).toBeUndefined()
    expect(select(store).answers.laptop_use).toBe('gaming')
  })

  it('does not go back before the first question', () => {
    const store = createStore()
    store.dispatch(goToPreviousQuestion())
    expect(select(store).currentQuestionId).toBe('category')
  })

  it('clears an answer when setAnswer receives undefined', () => {
    const store = createStore()
    store.dispatch(setAnswer({ questionId: 'category', answer: 'smartphone' }))
    expect(select(store).answers.category).toBe('smartphone')

    store.dispatch(setAnswer({ questionId: 'category', answer: undefined }))
    expect(select(store).answers.category).toBeUndefined()
  })

  it('resets the questionnaire to its initial state', () => {
    const store = createStore()
    const dispatch = store.dispatch

    dispatch(setAnswer({ questionId: 'category', answer: 'smartphone' }))
    dispatch(goToNextQuestion())
    dispatch(resetQuestionnaire())

    expect(select(store)).toEqual({
      currentQuestionId: questionnaireConfig.firstQuestionId,
      answers: {},
      history: [],
      isCompleted: false,
    })
  })

  it('ends the questionnaire via the other branch', () => {
    const store = createStore()
    const dispatch = store.dispatch

    dispatch(setAnswer({ questionId: 'category', answer: 'other' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('other_budget')

    dispatch(setAnswer({ questionId: 'other_budget', answer: 50 }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('contact')
  })
})
