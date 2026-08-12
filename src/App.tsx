import { useState } from 'react'

import { ResultsView } from '@/components/ResultsView'
import { QuestionCard } from '@/components/questionnaire/QuestionCard'
import { Progress } from '@/components/ui/progress'
import { questionnaireConfig } from '@/data/questionsData'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  goToNextQuestion,
  goToPreviousQuestion,
  resetQuestionnaire,
  setAnswer,
} from '@/store/questionnaireSlice'
import {
  selectAnswers,
  selectCurrentQuestion,
  selectHistory,
  selectIsCompleted,
} from '@/store/selectors'
import type { AnswerValue } from '@/types/questionnaire'

type Direction = 'forward' | 'backward'

function App() {
  const dispatch = useAppDispatch()
  const currentQuestion = useAppSelector(selectCurrentQuestion)
  const answers = useAppSelector(selectAnswers)
  const history = useAppSelector(selectHistory)
  const isCompleted = useAppSelector(selectIsCompleted)
  const [direction, setDirection] = useState<Direction>('forward')

  const answeredCount = Object.keys(answers).length
  const totalQuestions = questionnaireConfig.questions.length
  const progress = isCompleted
    ? 100
    : Math.round((answeredCount / totalQuestions) * 100)

  const handleAnswerChange = (answer: AnswerValue | undefined) => {
    if (!currentQuestion) {
      return
    }
    dispatch(setAnswer({ questionId: currentQuestion.id, answer }))
  }

  const handleNext = () => {
    setDirection('forward')
    dispatch(goToNextQuestion())
  }

  const handleBack = () => {
    setDirection('backward')
    dispatch(goToPreviousQuestion())
  }

  const handleRestart = () => {
    setDirection('forward')
    dispatch(resetQuestionnaire())
  }

  return (
    <main className="flex min-h-svh flex-col items-center px-4 py-10">
      <header className="mb-10 w-full max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          {questionnaireConfig.title}
        </h1>
        {questionnaireConfig.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {questionnaireConfig.description}
          </p>
        )}
        <div className="mt-4">
          <Progress value={progress} />
          <p className="mt-2 text-xs text-muted-foreground">
            {progress}% completed
          </p>
        </div>
      </header>

      {isCompleted ? (
        <ResultsView answers={answers} onRestart={handleRestart} />
      ) : currentQuestion ? (
        <div
          key={currentQuestion.id}
          className={cn(
            'w-full max-w-xl animate-in duration-300 ease-out',
            direction === 'forward'
              ? 'slide-in-from-right-4 fade-in'
              : 'slide-in-from-left-4 fade-in',
          )}
        >
          <QuestionCard
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            canGoBack={history.length > 0}
            onAnswerChange={handleAnswerChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>
      ) : null}
    </main>
  )
}

export default App
