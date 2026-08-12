import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { AnswerValue, Option } from '@/types/questionnaire'

interface MultipleChoiceProps {
  questionId: string
  options: Option[]
  value?: AnswerValue
  disabled?: boolean
  onChange: (value: string[]) => void
}

export function MultipleChoice({
  questionId,
  options,
  value,
  disabled,
  onChange,
}: MultipleChoiceProps) {
  const selected = Array.isArray(value) ? value : []

  const toggle = (optionId: string, checked: boolean) => {
    onChange(
      checked
        ? [...selected, optionId]
        : selected.filter((id) => id !== optionId),
    )
  }

  return (
    <div className="grid gap-2">
      {options.map((option) => {
        const optionId = `${questionId}-${option.id}`
        return (
          <div
            key={option.id}
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-accent"
          >
            <Checkbox
              id={optionId}
              checked={selected.includes(option.id)}
              onCheckedChange={(checked) => toggle(option.id, checked === true)}
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
    </div>
  )
}
