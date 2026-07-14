interface NumberStepperProps {
  label?: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
}

export function NumberStepper({ label, value, onChange, step = 1, min, max }: NumberStepperProps) {
  const clamp = (next: number) => {
    if (min !== undefined && next < min) return min
    if (max !== undefined && next > max) return max
    return next
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3.5 py-2.5">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="w-full bg-transparent text-sm text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <div className="flex flex-col">
          <button
            type="button"
            aria-label={`Increase ${label ?? 'value'}`}
            onClick={() => onChange(clamp(value + step))}
            className="text-gray-400 hover:text-brand-600"
          >
            <svg viewBox="0 0 12 7" className="size-2.5 fill-current">
              <path d="M6 0 12 6.5H0z" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={`Decrease ${label ?? 'value'}`}
            onClick={() => onChange(clamp(value - step))}
            className="mt-1 text-gray-400 hover:text-brand-600"
          >
            <svg viewBox="0 0 12 7" className="size-2.5 fill-current">
              <path d="M6 7 0 .5h12z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
