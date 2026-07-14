import { clsx } from '@/lib/clsx'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-2xl font-bold', className)}>
      <svg viewBox="0 0 24 24" className="size-6 text-brand-600" aria-hidden="true">
        <path
          d="M4 12c2-4 6-6 8-6s6 1 8 3c-2 4-6 6-8 6s-6-1-8-3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        <span className="text-brand-600">Prep</span>
        <span className="text-gray-900">route</span>
      </span>
    </span>
  )
}
