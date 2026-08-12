import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { questionnaireConfig } from '@/data/questionsData'
import type { Answers, AnswerValue } from '@/types/questionnaire'
import { getNextQuestionId } from '@/utils/questionEngine'

interface QuestionnaireState {
  currentQuestionId: string | null
  answers: Answers
  history: string[]
  isCompleted: boolean
}

const initialState: QuestionnaireState = {
  currentQuestionId: questionnaireConfig.firstQuestionId,
  answers: {},
  history: [],
  isCompleted: false,
}

const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState,
  reducers: {
    setAnswer(
      state,
      action: PayloadAction<{
        questionId: string
        answer: AnswerValue | undefined
      }>,
    ) {
      const { questionId, answer } = action.payload
      if (answer === undefined) {
        delete state.answers[questionId]
      } else {
        state.answers[questionId] = answer
      }
    },

    goToNextQuestion(state) {
      if (state.isCompleted || state.currentQuestionId === null) {
        return
      }

      const currentQuestion = questionnaireConfig.questions.find(
        (question) => question.id === state.currentQuestionId,
      )
      if (!currentQuestion) {
        state.isCompleted = true
        state.currentQuestionId = null
        return
      }

      const nextQuestionId = getNextQuestionId(
        currentQuestion,
        state.answers,
        questionnaireConfig.questions,
      )

      if (nextQuestionId === null) {
        state.currentQuestionId = null
        state.isCompleted = true
        return
      }

      state.history.push(state.currentQuestionId)
      state.currentQuestionId = nextQuestionId
    },

    goToPreviousQuestion(state) {
      if (state.isCompleted) {
        return
      }

      const previousId = state.history.pop()
      if (previousId === undefined) {
        return
      }

      if (state.currentQuestionId !== null) {
        delete state.answers[state.currentQuestionId]
      }
      state.currentQuestionId = previousId
    },

    resetQuestionnaire() {
      return {
        currentQuestionId: questionnaireConfig.firstQuestionId,
        answers: {},
        history: [],
        isCompleted: false,
      }
    },
  },
})

export const {
  setAnswer,
  goToNextQuestion,
  goToPreviousQuestion,
  resetQuestionnaire,
} = questionnaireSlice.actions

export default questionnaireSlice.reducer
