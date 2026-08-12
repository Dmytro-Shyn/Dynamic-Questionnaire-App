import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { AnswerValue, Option } from '@/types/questionnaire'

interface SingleChoiceProps {
  questionId: string
  options: Option[]
  value?: AnswerValue
  disabled?: boolean
  onChange: (value: string) => void
}

export function SingleChoice({
  questionId,
  options,
  value,
  disabled,
  onChange,
}: SingleChoiceProps) {
  return (
    <RadioGroup
      value={typeof value === 'string' ? value : ''}
      onValueChange={onChange}
      disabled={disabled}
      className="grid gap-2"
    >
      {options.map((option) => {
        const optionId = `${questionId}-${option.id}`
        return (
          <div
            key={option.id}
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-accent"
          >
            <RadioGroupItem
              id={optionId}
              value={option.id}
              disabled={disabled}
            />
            <Label htmlFor={optionId} className="flex-1 cursor-pointer">
              <span className="font-medium">{option.label}</span>
              {option.description && (
                <span className="block text-sm text-muted-foreground">
                  {option.description}
                </span>
              )}
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}
