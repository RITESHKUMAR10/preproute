import type { ButtonHTMLAttributes } from 'react'
import { clsx } from '@/lib/clsx'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300 focus-visible:outline-brand-600',
  secondary:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 disabled:text-brand-300 focus-visible:outline-brand-300',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100 disabled:text-red-300 focus-visible:outline-red-400',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:outline-gray-300',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
