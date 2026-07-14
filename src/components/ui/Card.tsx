import type { HTMLAttributes } from 'react'
import { clsx } from '@/lib/clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-2xl border border-gray-100 bg-white shadow-sm', className)}
      {...props}
    />
  )
}
