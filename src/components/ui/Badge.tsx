import type { ReactNode } from 'react'
import { clsx } from '@/lib/clsx'

type Tone = 'brand' | 'green' | 'amber' | 'gray' | 'red'

const toneClasses: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-50 text-red-600',
}

export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  )
}
