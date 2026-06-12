import { Link, useLocation } from 'react-router-dom'
import { Map, List, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const nav_items = [
    { to: '/', label: '地図', icon: Map },
    { to: '/records', label: '一覧', icon: List },
    { to: '/records/new', label: '記録', icon: Plus },
  ]

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-primary">生態学フィールドノート</h1>
        <p className="text-xs text-muted-foreground">電子野帳 — ローカル保存</p>
      </header>

      <main className="flex-1 overflow-auto">{children}</main>

      <nav className="flex border-t border-border bg-white">
        {nav_items.map(({ to, label, icon: Icon }) => {
          const is_active =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
                is_active ? 'text-accent font-medium' : 'text-muted-foreground hover:text-primary',
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
