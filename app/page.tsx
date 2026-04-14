'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, CheckCircle, TrendingUp, Briefcase, ListTodo, CalendarCheck, ChevronRight, Minus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { getStockOfTheDay } from '@/lib/stocks-list'

interface Holding { id: string; symbol: string; shares: number; avgCost: number }
interface StockPrice { price: number; change: number; changePct: number; name?: string }

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}
function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const [sotd] = useState(() => getStockOfTheDay(today))

  // Data from Supabase
  const [habits, setHabits] = useState<{ id: string; name: string }[]>([])
  const [todayCompletions, setTodayCompletions] = useState<Set<string>>(new Set())
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [pendingTodos, setPendingTodos] = useState<{ id: string; text: string; priority: string; dueDate?: string }[]>([])

  // Prices
  const [prices, setPrices] = useState<Record<string, StockPrice>>({})
  const [pricesLoading, setPricesLoading] = useState(false)
  const [sotdPrice, setSotdPrice] = useState<StockPrice | null>(null)

  useEffect(() => {
    if (!user) return

    // Load habits
    supabase.from('habits').select('id, name').eq('user_id', user.id)
      .then(({ data }) => setHabits(data ?? []))

    // Load today's completions
    supabase.from('habit_completions').select('habit_id')
      .eq('user_id', user.id).eq('date', todayStr)
      .then(({ data }) => setTodayCompletions(new Set((data ?? []).map(c => c.habit_id))))

    // Load holdings
    supabase.from('holdings').select('*').eq('user_id', user.id)
      .then(({ data }) => setHoldings((data ?? []).map(h => ({
        id: h.id, symbol: h.symbol, shares: Number(h.shares), avgCost: Number(h.avg_cost)
      }))))

    // Load pending todos
    supabase.from('todos').select('id, text, priority, due_date')
      .eq('user_id', user.id).eq('completed', false).order('created_at', { ascending: false })
      .then(({ data }) => setPendingTodos((data ?? []).map(t => ({
        id: t.id, text: t.text, priority: t.priority ?? 'medium', dueDate: t.due_date ?? undefined
      }))))
  }, [user, todayStr])

  // Fetch portfolio prices
  useEffect(() => {
    if (!holdings.length) return
    setPricesLoading(true)
    const unique = [...new Set(holdings.map(h => h.symbol))]
    Promise.all(
      unique.map(sym =>
        fetch(`/api/stock-price?symbol=${sym}`)
          .then(r => r.json())
          .then(d => ({ sym, data: d }))
          .catch(() => ({ sym, data: null }))
      )
    ).then(results => {
      const map: Record<string, StockPrice> = {}
      results.forEach(({ sym, data }) => { if (data && !data.error) map[sym] = data })
      setPrices(map)
      setPricesLoading(false)
    })
  }, [holdings])

  // Fetch SOTD price
  useEffect(() => {
    fetch(`/api/stock-price?symbol=${sotd.symbol}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setSotdPrice(d) })
      .catch(() => {})
  }, [sotd.symbol])

  const todayDone = habits.filter(h => todayCompletions.has(h.id)).length
  const habitPct = habits.length > 0 ? Math.round((todayDone / habits.length) * 100) : 0

  const portfolioStats = holdings.reduce(
    (acc, h) => {
      const p = prices[h.symbol]
      if (p) {
        acc.totalValue += h.shares * p.price
        acc.totalCost += h.shares * h.avgCost
        acc.totalPnl += h.shares * p.price - h.shares * h.avgCost
      }
      return acc
    },
    { totalValue: 0, totalCost: 0, totalPnl: 0 }
  )
  const pnlPct = portfolioStats.totalCost > 0
    ? (portfolioStats.totalPnl / portfolioStats.totalCost) * 100 : 0

  const highPriority = pendingTodos.filter(t => t.priority === 'high')

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8 border-b border-gold-border pb-6">
        <p className="label-sm mb-2">Protocol No. 01 — Dashboard</p>
        <h2 className="text-cream text-2xl md:text-3xl font-light tracking-wide">{formatDate(today)}</h2>
        <p className="text-muted text-sm mt-1">
          {todayDone}/{habits.length} habits · {pendingTodos.length} tasks pending
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card p-4 flex flex-col gap-2">
          <p className="label-sm">Today&apos;s Habits</p>
          <span className="text-3xl font-bold text-cream font-num">{habitPct}%</span>
          <div className="h-1.5 bg-surface3 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${habitPct}%`, background: habitPct >= 80 ? '#5DB87A' : habitPct >= 50 ? '#C9A96E' : '#888888' }} />
          </div>
          <p className="text-muted text-xs">{todayDone}/{habits.length} complete</p>
        </div>

        <div className="card p-4 flex flex-col gap-2">
          <p className="label-sm">Portfolio</p>
          {pricesLoading ? (
            <p className="text-muted text-sm animate-pulse-gold">Loading...</p>
          ) : portfolioStats.totalValue > 0 ? (
            <>
              <span className="text-2xl font-bold text-cream font-num">{formatCurrency(portfolioStats.totalValue)}</span>
              <div className={`flex items-center gap-1 text-xs ${portfolioStats.totalPnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                {portfolioStats.totalPnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span className="font-num">{portfolioStats.totalPnl >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalPnl)} ({pnlPct.toFixed(2)}%)</span>
              </div>
            </>
          ) : (
            <p className="text-muted text-xs">No holdings yet</p>
          )}
        </div>

        <div className="card p-4 flex flex-col gap-2">
          <p className="label-sm">Open Tasks</p>
          <span className="text-3xl font-bold text-cream font-num">{pendingTodos.length}</span>
          {highPriority.length > 0 && <p className="text-negative text-xs">{highPriority.length} high priority</p>}
          {pendingTodos.length === 0 && <p className="text-positive text-xs">All clear ✓</p>}
        </div>

        <div className="card p-4 flex flex-col gap-2">
          <p className="label-sm">Stock of the Day</p>
          <span className="text-2xl font-bold text-gold font-num">{sotd.symbol}</span>
          {sotdPrice ? (
            <div className={`flex items-center gap-1 text-xs ${sotdPrice.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
              {sotdPrice.changePct >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span className="font-num">${sotdPrice.price.toFixed(2)} ({sotdPrice.changePct >= 0 ? '+' : ''}{sotdPrice.changePct.toFixed(2)}%)</span>
            </div>
          ) : (
            <p className="text-muted text-xs">{sotd.sector}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card p-5 corner-mark">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="label-sm mb-1">Stock of the Day</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-gold text-2xl font-bold tracking-wider">{sotd.symbol}</h3>
                <span className="text-cream text-sm">{sotd.name}</span>
              </div>
              <p className="text-muted text-xs mt-1">{sotd.sector} · {sotd.industry}</p>
            </div>
            {sotdPrice && (
              <div className="text-right">
                <p className="text-cream font-bold font-num text-lg">${sotdPrice.price.toFixed(2)}</p>
                <p className={`text-xs font-num ${sotdPrice.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {sotdPrice.changePct >= 0 ? '+' : ''}{sotdPrice.changePct.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
          <p className="text-muted-light text-sm leading-relaxed mb-3 line-clamp-3">{sotd.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {sotd.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-gold-border text-gold bg-gold-dim">{tag}</span>
            ))}
          </div>
          <Link href="/stocks" className="flex items-center gap-1 text-gold text-xs uppercase tracking-widest hover:gap-2 transition-all">
            View full analysis <ChevronRight size={12} />
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { href: '/habits', icon: CalendarCheck, label: 'Habit Tracker', sub: `${todayDone}/${habits.length} today` },
            { href: '/portfolio', icon: Briefcase, label: 'Portfolio', sub: holdings.length > 0 ? `${holdings.length} holdings` : 'Add stocks' },
            { href: '/stocks', icon: TrendingUp, label: 'Market News', sub: 'Daily updates' },
            { href: '/todo', icon: ListTodo, label: 'Task List', sub: `${pendingTodos.length} pending` },
          ].map(({ href, icon: Icon, label, sub }) => (
            <Link key={href} href={href}
              className="card p-3.5 flex items-center gap-3 hover:bg-surface2 transition-colors group">
              <div className="w-8 h-8 rounded-md bg-gold-dim border border-gold-border flex items-center justify-center shrink-0">
                <Icon size={15} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cream text-xs font-medium uppercase tracking-wider">{label}</p>
                <p className="text-muted text-xs truncate">{sub}</p>
              </div>
              <ChevronRight size={14} className="text-muted group-hover:text-gold transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {pendingTodos.length > 0 && (
        <div className="mt-4 card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="label-sm">Pending Tasks</p>
            <Link href="/todo" className="text-gold text-xs uppercase tracking-widest hover:underline">View all</Link>
          </div>
          <div className="flex flex-col gap-1.5">
            {pendingTodos.slice(0, 4).map(todo => (
              <div key={todo.id} className="flex items-center gap-2.5 py-1.5 border-b border-gold-border last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  todo.priority === 'high' ? 'bg-negative' : todo.priority === 'medium' ? 'bg-gold' : 'bg-muted'
                }`} />
                <span className="text-cream text-sm flex-1 truncate">{todo.text}</span>
                {todo.dueDate && (
                  <span className="text-muted text-xs shrink-0">
                    {new Date(todo.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <Minus size={12} className="text-muted shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {habits.length === 0 && holdings.length === 0 && pendingTodos.length === 0 && (
        <div className="mt-6 card p-6 border-dashed text-center">
          <CheckCircle size={28} className="text-gold mx-auto mb-3 opacity-60" />
          <p className="text-cream text-sm font-medium mb-1">Welcome to PROTOCOL</p>
          <p className="text-muted text-xs mb-4">Set up your habits, add your stocks, and start your task list.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/habits" className="btn-gold">Add Habits</Link>
            <Link href="/portfolio" className="btn-gold">Add Portfolio</Link>
            <Link href="/todo" className="btn-gold">Add Tasks</Link>
          </div>
        </div>
      )}
    </div>
  )
}
