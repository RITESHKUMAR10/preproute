import { useEffect, useRef, useState } from 'react'
import { clsx } from '@/lib/clsx'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  label?: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Choose from Drop-down',
  error,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleValue = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const selectedLabels = options.filter((o) => value.includes(o.value))

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={clsx(
            'flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-gray-50',
            error && 'border-red-400',
          )}
        >
          {selectedLabels.length === 0 && <span className="text-gray-400">{placeholder}</span>}
          {selectedLabels.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
            >
              {option.label}
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleValue(option.value)
                }}
                className="cursor-pointer text-brand-400 hover:text-brand-700"
              >
                ×
              </span>
            </span>
          ))}
        </button>
        {open && !disabled && (
          <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {options.length === 0 && (
              <div className="px-3.5 py-2 text-sm text-gray-400">No options available</div>
            )}
            {options.map((option) => {
              const checked = value.includes(option.value)
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleValue(option.value)}
                    className="size-4 rounded border-gray-300 text-brand-600 focus:ring-brand-200"
                  />
                  {option.label}
                </label>
              )
            })}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
