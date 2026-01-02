import { Input } from './input'

interface DateTimeFieldProps {
  value?: Date | null
  onChange: (value: Date | null) => void
}

export function DateTimeField({ value, onChange }: DateTimeFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value ? new Date(e.target.value) : null)
  }

  // Format date for HTML datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <Input
      type="datetime-local"
      onChange={handleChange}
      value={value ? formatDateForInput(value) : ''}
    />
  )
}
