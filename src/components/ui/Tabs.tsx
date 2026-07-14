import { clsx } from '@/lib/clsx'

export interface TabOption {
  value: string
  label: string
}

interface TabsProps {
  options: TabOption[]
  value: string
  onChange: (value: string) => void
}

export function Tabs({ options, value, onChange }: TabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              active ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
