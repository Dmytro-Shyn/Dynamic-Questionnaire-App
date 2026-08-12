import { ArrowLeft, ArrowRight } from 'lucide-react'

import { MultipleChoice } from '@/components/questionnaire/MultipleChoice'
import { NumberInput } from '@/components/questionnaire/NumberInput'
import { SingleChoice } from '@/components/questionnaire/SingleChoice'
import { TextInput } from '@/components/questionnaire/TextInput'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { AnswerValue, Question } from '@/types/questionnaire'
import { validateAnswer } from '@/utils/validation'

interface QuestionCardProps {
  question: Question
  answer: AnswerValue | undefined
  canGoBack: boolean
  onAnswerChange: (answer: AnswerValue | undefined) => void
  onNext: () => void
  onBack: () => void
}

export function QuestionCard({
  question,
  answer,
  canGoBack,
  onAnswerChange,
  onNext,
  onBack,
}: QuestionCardProps) {
  const touched = answer !== undefined
  const error = touched ? validateAnswer(question, answer) : null
  const canProceed =
    error === null && (touched || !question.validation?.required)

  const handleNext = () => {
    if (canProceed) {
      onNext()
    }
  }

  const renderInput = () => {
    switch (question.type) {
      case 'single':
        return (
          <SingleChoice
            questionId={question.id}
            options={question.options ?? []}
            value={answer}
            onChange={onAnswerChange}
          />
        )
      case 'multiple':
        return (
          <MultipleChoice
            questionId={question.id}
            options={question.options ?? []}
            value={answer}
            onChange={onAnswerChange}
          />
        )
      case 'text':
        return (
          <TextInput
            value={answer}
            placeholder={question.placeholder}
            onChange={onAnswerChange}
            onSubmit={handleNext}
          />
        )
      case 'number':
        return (
          <NumberInput
            value={answer}
            placeholder={question.placeholder}
            min={question.validation?.min}
            max={question.validation?.max}
            onChange={onAnswerChange}
            onSubmit={handleNext}
          />
        )
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{question.title}</CardTitle>
        {question.description && (
          <CardDescription>{question.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {renderInput()}
        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={onBack} disabled={!canGoBack}>
          <ArrowLeft />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed}>
          Next
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  )
}
