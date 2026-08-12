import { createSelector } from '@reduxjs/toolkit'

import { questionnaireConfig } from '@/data/questionsData'
import type { RootState } from './index'

const selectQuestionnaireState = (state: RootState) => state.questionnaire

export const selectCurrentQuestionId = (state: RootState) =>
  state.questionnaire.currentQuestionId

export const selectAnswers = (state: RootState) => state.questionnaire.answers

export const selectHistory = (state: RootState) => state.questionnaire.history

export const selectIsCompleted = (state: RootState) =>
  state.questionnaire.isCompleted

export const selectCurrentQuestion = createSelector(
  [selectQuestionnaireState],
  (questionnaire) =>
    questionnaire.currentQuestionId === null
      ? null
      : (questionnaireConfig.questions.find(
          (question) => question.id === questionnaire.currentQuestionId,
        ) ?? null),
)
