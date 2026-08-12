import { useState } from 'react'

import { Input } from '@/components/ui/input'
import type { AnswerValue } from '@/types/questionnaire'

interface NumberInputProps {
  value?: AnswerValue
  placeholder?: string
  min?: number
  max?: number
  disabled?: boolean
  onSubmit?: () => void
  onChange: (value: number | undefined) => void
}

export function NumberInput({
  value,
  placeholder,
  min,
  max,
  disabled,
  onSubmit,
  onChange,
}: NumberInputProps) {
  const [text, setText] = useState(
    typeof value === 'number' ? String(value) : '',
  )

  const handleChange = (raw: string) => {
    setText(raw)
    if (raw === '') {
      onChange(undefined)
      return
    }
    const parsed = Number(raw)
    if (Number.isFinite(parsed)) {
      onChange(parsed)
    }
  }

  return (
    <Input
      type="number"
      inputMode="decimal"
      value={text}
      min={min}
      max={max}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus
      onChange={(event) => handleChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && onSubmit) {
          onSubmit()
        }
      }}
    />
  )
}
