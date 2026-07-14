import { clsx } from '@/lib/clsx'

export interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  label?: string
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  error?: string
}

export function RadioGroup({ label, name, options, value, onChange, error }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <div className="flex flex-wrap items-center gap-6">
        {options.map((option) => {
          const checked = value === option.value
          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                className={clsx(
                  'flex size-4 items-center justify-center rounded-full border-2',
                  checked ? 'border-brand-600' : 'border-gray-300',
                )}
              >
                {checked && <span className="size-2 rounded-full bg-brand-600" />}
              </span>
              {option.label}
            </label>
          )
        })}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
