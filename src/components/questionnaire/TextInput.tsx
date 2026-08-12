import { Input } from '@/components/ui/input'
import type { AnswerValue } from '@/types/questionnaire'

interface TextInputProps {
  value?: AnswerValue
  placeholder?: string
  disabled?: boolean
  onSubmit?: () => void
  onChange: (value: string) => void
}

export function TextInput({
  value,
  placeholder,
  disabled,
  onSubmit,
  onChange,
}: TextInputProps) {
  return (
    <Input
      type="text"
      value={typeof value === 'string' ? value : ''}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && onSubmit) {
          onSubmit()
        }
      }}
    />
  )
}
