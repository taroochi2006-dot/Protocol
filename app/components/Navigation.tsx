'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CalendarCheck, TrendingUp, Briefcase, ListTodo, LogOut, Newspaper } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CalendarCheck },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/stocks', label: 'Stocks', icon: TrendingUp },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/todo', label: 'Tasks', icon: ListTodo },
]

export default function Navigation({ mode }: { mode: 'sidebar' | 'bottom' }) {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/auth')
  }

  if (mode === 'sidebar') {
    return (
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 text-sm tracking-wide group ${
                active
                  ? 'bg-gold-dim text-gold border border-gold-border'
                  : 'text-muted hover:text-cream hover:bg-surface2'
              }`}
            >
              <Icon size={16} className={active ? 'text-gold' : 'text-muted group-hover:text-cream'} />
              <span className={`uppercase tracking-widest text-xs font-medium ${active ? 'text-gold' : ''}`}>
                {label}
              </span>
              {active && <span className="ml-auto w-1 h-1 rounded-full bg-gold" />}
            </Link>
          )
        })}

        {user && (
          <div className="mt-4 pt-4 border-t border-gold-border">
            <p className="text-muted text-xs px-3 mb-2 truncate">{user.email}</p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 text-muted hover:text-negative hover:bg-surface2 w-full text-left"
            >
              <LogOut size={16} />
              <span className="uppercase tracking-widest text-xs font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </nav>
    )
  }

  return (
    <div className="flex items-center justify-around h-16 px-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-all ${
              active ? 'text-gold' : 'text-muted'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] tracking-widest uppercase">{label}</span>
          </Link>
        )
      })}
    </div>
  )
}
