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
  it('walks the full flow to completion', () => {
    const store = createStore()
    const dispatch = store.dispatch

    expect(select(store).currentQuestionId).toBe('category')

    dispatch(setAnswer({ questionId: 'category', answer: 'smartphone' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('budget')

    dispatch(setAnswer({ questionId: 'budget', answer: 2000 }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('brand_premium')

    dispatch(setAnswer({ questionId: 'brand_premium', answer: 'apple' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('features')

    dispatch(
      setAnswer({ questionId: 'features', answer: ['camera', 'battery'] }),
    )
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('color')

    dispatch(setAnswer({ questionId: 'color', answer: 'dark' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('contact')

    dispatch(setAnswer({ questionId: 'contact', answer: 'a@b.com' }))
    dispatch(goToNextQuestion())
    expect(select(store).isCompleted).toBe(true)
    expect(select(store).currentQuestionId).toBeNull()
    expect(select(store).answers.contact).toBe('a@b.com')
  })

  it('branches to a different path for gaming laptops', () => {
    const store = createStore()
    const dispatch = store.dispatch

    dispatch(setAnswer({ questionId: 'category', answer: 'laptop' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('laptop_use')

    dispatch(setAnswer({ questionId: 'laptop_use', answer: 'gaming' }))
    dispatch(goToNextQuestion())
    expect(select(store).currentQuestionId).toBe('laptop_gpu')
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
})
