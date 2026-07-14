import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from '@/lib/clsx'
import { Logo } from '@/components/Logo'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, match: (path: string) => path === '/dashboard' },
  { to: '/tests/new', label: 'Test Creation', icon: EditIcon, match: (path: string) => path.startsWith('/tests') },
  { to: '/tracking', label: 'Test Tracking', icon: TrackingIcon, match: (path: string) => path.startsWith('/tracking') },
]

export function AppShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white px-4 py-6 sm:flex">
        <Logo className="px-2" />
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.match(location.pathname)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end gap-4 border-b border-gray-100 bg-white px-6">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <BellIcon className="size-5" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-500" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {(user?.name ?? user?.userId ?? 'A').toString().charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.name?.toString() ?? user?.userId?.toString() ?? 'Admin'}
              </p>
              <p className="text-xs text-gray-400">{user?.role?.toString() ?? 'Admin'}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
              className="ml-2 text-xs font-medium text-gray-400 hover:text-brand-600"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrackingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
