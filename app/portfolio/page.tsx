'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Trash2, RefreshCw, ArrowUpRight, ArrowDownRight, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { searchStocks, type StockEntry } from '@/lib/stocks-data'

const REFRESH_INTERVAL = 30

interface Holding { id: string; symbol: string; shares: number; avgCost: number; addedAt: string }
interface PriceData {
  symbol: string; name: string; price: number; change: number; changePct: number
  dayHigh?: number; dayLow?: number; volume?: number; marketCap?: number
  prevClose?: number; marketState?: string; error?: string
}

function fmtCur(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}
function fmtBig(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return fmtCur(n)
}
function fmtShares(n: number) {
  return n % 1 === 0 ? n.toString() : n.toFixed(3).replace(/\.?0+$/, '')
}

function StockSearch({ value, onChange, onSelect }: {
  value: string
  onChange: (v: string) => void
  onSelect: (s: StockEntry) => void
}) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<StockEntry[]>([])
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const r = searchStocks(value)
    setResults(r)
    setOpen(r.length > 0 && value.length > 0)
    setActive(0)
  }, [value])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); if (results[active]) { onSelect(results[active]); setOpen(false) } }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <input
        className="input-base uppercase"
        placeholder="Search ticker or company name..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => { if (results.length > 0) setOpen(true) }}
        autoComplete="off"
        spellCheck={false}
      />
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface2 border border-gold-border rounded-lg overflow-hidden shadow-2xl animate-slide-up">
          {results.map((s, i) => (
            <button
              key={s.symbol}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface3 ${i === active ? 'bg-surface3' : ''}`}
              onMouseDown={e => { e.preventDefault(); onSelect(s); setOpen(false) }}
              onMouseEnter={() => setActive(i)}
            >
              <div className="w-14 shrink-0"><span className="text-gold font-bold text-sm">{s.symbol}</span></div>
              <div className="flex-1 min-w-0"><p className="text-cream text-xs truncate">{s.name}</p></div>
              {s.sector && <span className="text-muted text-xs shrink-0 hidden sm:block">{s.sector}</span>}
            </button>
          ))}
          {value.length >= 2 && results.length === 0 && (
            <div className="px-3 py-2.5 text-muted text-xs">No matches — you can still type any valid ticker manually.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PortfolioPage() {
  const { user } = useAuth()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ symbol: '', shares: '', avgCost: '' })
  const [selectedStock, setSelectedStock] = useState<StockEntry | null>(null)
  const [formError, setFormError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const holdingsRef = useRef(holdings)
  holdingsRef.current = holdings

  // Load holdings from Supabase
  const loadHoldings = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at')
    const mapped: Holding[] = (data ?? []).map(h => ({
      id: h.id,
      symbol: h.symbol,
      shares: Number(h.shares),
      avgCost: Number(h.avg_cost),
      addedAt: h.created_at,
    }))
    setHoldings(mapped)
    setDataLoading(false)
  }, [user])

  useEffect(() => {
    loadHoldings()
  }, [loadHoldings])

  const fetchPrices = useCallback(async (syms?: string[]) => {
    const symbols = syms ?? [...new Set(holdingsRef.current.map(h => h.symbol))]
    if (!symbols.length) return
    setLoading(true)
    const results = await Promise.all(
      symbols.map(sym =>
        fetch(`/api/stock-price?symbol=${encodeURIComponent(sym)}`)
          .then(r => r.json())
          .then(d => ({ sym: sym.toUpperCase(), data: d }))
          .catch(() => ({ sym: sym.toUpperCase(), data: { error: 'Network error' } }))
      )
    )
    setPrices(prev => {
      const next = { ...prev }
      results.forEach(({ sym, data }) => { next[sym] = data })
      return next
    })
    setLastUpdated(new Date())
    setCountdown(REFRESH_INTERVAL)
    setLoading(false)
  }, [])

  useEffect(() => {
    const syms = [...new Set(holdings.map(h => h.symbol))]
    if (syms.length) fetchPrices(syms)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdings.map(h => h.symbol).join(',')])

  useEffect(() => {
    const interval = setInterval(() => fetchPrices(), REFRESH_INTERVAL * 1000)
    return () => clearInterval(interval)
  }, [fetchPrices])

  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => c > 0 ? c - 1 : REFRESH_INTERVAL), 1000)
    return () => clearInterval(tick)
  }, [])

  function handleSelectStock(s: StockEntry) {
    setSelectedStock(s)
    setForm(f => ({ ...f, symbol: s.symbol }))
  }

  async function addHolding() {
    setFormError('')
    const sym = form.symbol.trim().toUpperCase()
    const shares = parseFloat(form.shares)
    const avgCost = parseFloat(form.avgCost)
    if (!sym) { setFormError('Search and select a stock above'); return }
    if (!shares || shares <= 0) { setFormError('Enter valid number of shares'); return }
    if (!avgCost || avgCost <= 0) { setFormError('Enter the price you paid per share'); return }
    if (!user) return

    const existing = holdings.find(h => h.symbol === sym)
    if (existing) {
      const totalShares = existing.shares + shares
      const newAvg = (existing.shares * existing.avgCost + shares * avgCost) / totalShares
      const { error } = await supabase
        .from('holdings')
        .update({ shares: totalShares, avg_cost: newAvg })
        .eq('id', existing.id)
        .eq('user_id', user.id)
      if (!error) {
        setHoldings(prev => prev.map(h => h.symbol === sym ? { ...h, shares: totalShares, avgCost: newAvg } : h))
      }
    } else {
      const { data, error } = await supabase
        .from('holdings')
        .insert({ user_id: user.id, symbol: sym, shares, avg_cost: avgCost })
        .select()
        .single()
      if (!error && data) {
        const newHolding: Holding = {
          id: data.id,
          symbol: data.symbol,
          shares: Number(data.shares),
          avgCost: Number(data.avg_cost),
          addedAt: data.created_at,
        }
        setHoldings(prev => [...prev, newHolding])
      }
    }

    setForm({ symbol: '', shares: '', avgCost: '' })
    setSelectedStock(null)
    setShowAdd(false)
    setTimeout(() => fetchPrices([sym]), 100)
  }

  async function removeHolding(id: string) {
    setHoldings(prev => prev.filter(h => h.id !== id))
    await supabase.from('holdings').delete().eq('id', id).eq('user_id', user!.id)
  }

  const totals = holdings.reduce((acc, h) => {
    const p = prices[h.symbol]
    if (p && !p.error) {
      acc.value += h.shares * p.price
      acc.cost += h.shares * h.avgCost
      acc.pnl += h.shares * p.price - h.shares * h.avgCost
    }
    return acc
  }, { value: 0, cost: 0, pnl: 0 })
  const totalPct = totals.cost > 0 ? (totals.pnl / totals.cost) * 100 : 0

  const previewShares = parseFloat(form.shares)
  const previewCost = parseFloat(form.avgCost)
  const previewPosition = !isNaN(previewShares) && !isNaN(previewCost) && previewShares > 0 && previewCost > 0
    ? previewShares * previewCost : null

  if (dataLoading) {
    return (
      <div className="p-5 md:p-8 flex items-center justify-center min-h-96">
        <p className="text-muted animate-pulse-gold">Loading portfolio...</p>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 border-b border-gold-border pb-5">
        <p className="label-sm mb-1">Protocol — Portfolio</p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-cream text-2xl font-light tracking-wide">Stock Portfolio</h2>
          <div className="flex gap-2">
            <button className="btn-gold flex items-center gap-1.5" onClick={() => fetchPrices()} disabled={loading}>
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              className="btn-gold flex items-center gap-1.5"
              onClick={() => { setShowAdd(s => !s); setForm({ symbol: '', shares: '', avgCost: '' }); setSelectedStock(null); setFormError('') }}
            >
              {showAdd ? <X size={12} /> : <Plus size={12} />}
              {showAdd ? 'Cancel' : 'Add Stock'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {lastUpdated && <p className="text-muted text-xs">Updated {lastUpdated.toLocaleTimeString()}</p>}
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse-gold inline-block" />
            <span className="text-positive">Live</span>
            <span className="text-muted">· refreshes in {countdown}s</span>
          </span>
          {loading && <span className="text-muted text-xs inline-flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Fetching...</span>}
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-5 card p-4 animate-slide-up">
          <p className="label-sm mb-3">Add Position</p>
          <div className="mb-3">
            <label className="text-muted text-xs block mb-1.5 uppercase tracking-wider">Stock</label>
            <StockSearch
              value={form.symbol}
              onChange={v => { setForm(f => ({ ...f, symbol: v })); setSelectedStock(null) }}
              onSelect={handleSelectStock}
            />
            {selectedStock && (
              <p className="text-muted text-xs mt-1.5">
                ✓ <span className="text-cream">{selectedStock.name}</span>
                {selectedStock.sector && <span className="text-muted"> · {selectedStock.sector}</span>}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-muted text-xs block mb-1.5 uppercase tracking-wider">Number of Shares</label>
              <input
                className="input-base" placeholder="e.g. 10" type="number" min="0" step="0.001"
                value={form.shares} onChange={e => setForm(f => ({ ...f, shares: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-muted text-xs block mb-1.5 uppercase tracking-wider">
                Price Paid Per Share ($)
                <span className="text-muted normal-case tracking-normal ml-1">— avg cost</span>
              </label>
              <input
                className="input-base" placeholder="e.g. 150.00" type="number" min="0" step="0.01"
                value={form.avgCost}
                onChange={e => setForm(f => ({ ...f, avgCost: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addHolding()}
              />
            </div>
          </div>
          {previewPosition != null && (
            <div className="mb-3 bg-gold-dim border border-gold-border rounded-lg px-4 py-3 flex items-center justify-between">
              <p className="text-muted text-xs">{fmtShares(previewShares)} shares × {fmtCur(previewCost)} =</p>
              <p className="text-gold font-bold font-num text-lg">{fmtCur(previewPosition)} position</p>
            </div>
          )}
          {formError && <p className="text-negative text-xs mb-2">{formError}</p>}
          <button className="btn-gold" onClick={addHolding}>Add Position</button>
        </div>
      )}

      {/* Empty state */}
      {holdings.length === 0 ? (
        <div className="card p-10 text-center border-dashed">
          <div className="text-5xl mb-4">📈</div>
          <p className="text-cream font-medium mb-2">No holdings yet</p>
          <p className="text-muted text-sm mb-4">Add your stock positions to track your portfolio in real time.</p>
          <button className="btn-gold mx-auto" onClick={() => setShowAdd(true)}>+ Add Your First Stock</button>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="card p-4 corner-mark col-span-2 md:col-span-1">
              <p className="label-sm mb-1">Total Value</p>
              <p className="text-cream text-2xl font-bold font-num">{fmtCur(totals.value)}</p>
              <p className="text-muted text-xs mt-0.5">Cost basis: {fmtCur(totals.cost)}</p>
            </div>
            <div className="card p-4 col-span-2 md:col-span-1">
              <p className="label-sm mb-1">Total P&L</p>
              <p className={`text-2xl font-bold font-num ${totals.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                {totals.pnl >= 0 ? '+' : ''}{fmtCur(totals.pnl)}
              </p>
              <div className={`flex items-center gap-1 text-xs mt-0.5 ${totals.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                {totals.pnl >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                <span className="font-num">{Math.abs(totalPct).toFixed(2)}% total return</span>
              </div>
            </div>
            <div className="card p-4 col-span-2">
              <p className="label-sm mb-2">Today&apos;s Movement</p>
              <div className="flex gap-3 flex-wrap">
                {holdings.map(h => {
                  const p = prices[h.symbol]
                  if (!p || p.error) return null
                  const todayPnl = h.shares * p.change
                  return (
                    <div key={h.id} className="flex items-center gap-1.5">
                      <span className="text-gold text-xs font-bold">{h.symbol}</span>
                      <span className={`text-xs font-num ${todayPnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {todayPnl >= 0 ? '+' : ''}{fmtCur(todayPnl)}
                      </span>
                    </div>
                  )
                })}
                {loading && <span className="text-muted text-xs animate-pulse-gold">Loading...</span>}
              </div>
            </div>
          </div>

          {/* Holdings cards */}
          <div className="flex flex-col gap-3 mb-4">
            {holdings.map(h => {
              const p = prices[h.symbol]
              const mktVal = p && !p.error ? h.shares * p.price : null
              const cost = h.shares * h.avgCost
              const pnl = mktVal != null ? mktVal - cost : null
              const pnlPct = pnl != null ? (pnl / cost) * 100 : null
              const todayPnl = p && !p.error ? h.shares * p.change : null
              const alloc = mktVal != null && totals.value > 0 ? (mktVal / totals.value) * 100 : 0
              const isExpanded = expandedId === h.id
              const isUp = pnl != null ? pnl >= 0 : null

              return (
                <div key={h.id} className={`card overflow-hidden transition-all ${isUp === true ? 'border-positive/20' : isUp === false ? 'border-negative/20' : ''}`}>
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface2 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : h.id)}
                  >
                    <div className="w-1 self-stretch rounded-full shrink-0"
                      style={{ background: isUp === true ? '#5DB87A' : isUp === false ? '#D95F5F' : '#444' }} />
                    <div className="w-20 shrink-0">
                      <p className="text-gold font-bold text-base">{h.symbol}</p>
                      <p className="text-muted text-xs truncate">{p?.name || fmtShares(h.shares) + ' shares'}</p>
                    </div>
                    <div className="flex-1 text-right md:text-left">
                      {mktVal != null ? (
                        <>
                          <p className="text-cream font-bold font-num text-lg leading-tight">{fmtCur(mktVal)}</p>
                          <p className="text-muted text-xs">{fmtShares(h.shares)} shares</p>
                        </>
                      ) : (
                        <p className="text-muted text-sm">{loading ? 'Loading...' : 'Price unavailable'}</p>
                      )}
                    </div>
                    <div className="hidden sm:block text-right w-28">
                      {pnl != null ? (
                        <>
                          <p className={`font-bold font-num text-sm ${isUp ? 'text-positive' : 'text-negative'}`}>
                            {pnl >= 0 ? '+' : ''}{fmtCur(pnl)}
                          </p>
                          <div className={`flex items-center justify-end gap-0.5 text-xs ${isUp ? 'text-positive' : 'text-negative'}`}>
                            {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                            <span className="font-num">{Math.abs(pnlPct!).toFixed(2)}%</span>
                          </div>
                        </>
                      ) : <p className="text-muted text-xs">—</p>}
                    </div>
                    <div className="hidden md:block text-right w-24">
                      {p && !p.error ? (
                        <>
                          <p className={`text-xs font-num ${p.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                            {p.changePct >= 0 ? '+' : ''}{p.changePct.toFixed(2)}% today
                          </p>
                          {todayPnl != null && (
                            <p className={`text-xs font-num ${todayPnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {todayPnl >= 0 ? '+' : ''}{fmtCur(todayPnl)}
                            </p>
                          )}
                        </>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                      <button
                        onClick={e => { e.stopPropagation(); removeHolding(h.id) }}
                        className="text-muted hover:text-negative transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {mktVal != null && (
                    <div className="px-4 pb-2 -mt-1">
                      <div className="h-0.5 bg-surface3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${alloc}%`, background: 'linear-gradient(to right, #C9A96E, #D4B88A)' }} />
                      </div>
                      <p className="text-muted text-xs mt-0.5">{alloc.toFixed(1)}% of portfolio</p>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="border-t border-gold-border bg-surface2 px-4 py-3 animate-slide-up">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                        {[
                          { label: 'Current Price', val: p && !p.error ? fmtCur(p.price) : '—' },
                          { label: 'Avg Cost / Share', val: fmtCur(h.avgCost) },
                          { label: 'Position Cost', val: fmtCur(cost) },
                          { label: 'Position Value', val: mktVal ? fmtCur(mktVal) : '—' },
                          { label: 'Shares Owned', val: fmtShares(h.shares) },
                          { label: 'Day High', val: p?.dayHigh ? fmtCur(p.dayHigh) : '—' },
                          { label: 'Day Low', val: p?.dayLow ? fmtCur(p.dayLow) : '—' },
                          { label: 'Prev Close', val: p?.prevClose ? fmtCur(p.prevClose) : '—' },
                          { label: 'Market Cap', val: p?.marketCap ? fmtBig(p.marketCap) : '—' },
                          { label: 'Volume', val: p?.volume ? p.volume.toLocaleString() : '—' },
                        ].map(({ label, val }) => (
                          <div key={label} className="bg-surface rounded p-2">
                            <p className="label-sm">{label}</p>
                            <p className="text-cream font-num mt-0.5">{val}</p>
                          </div>
                        ))}
                      </div>
                      {pnl != null && (
                        <div className="sm:hidden mt-3 flex items-center justify-between bg-surface rounded p-3">
                          <div>
                            <p className="label-sm">Total P&L</p>
                            <p className={`font-bold font-num text-lg ${isUp ? 'text-positive' : 'text-negative'}`}>
                              {pnl >= 0 ? '+' : ''}{fmtCur(pnl)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="label-sm">Return</p>
                            <p className={`font-bold font-num text-lg ${isUp ? 'text-positive' : 'text-negative'}`}>
                              {pnlPct! >= 0 ? '+' : ''}{pnlPct!.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Allocation bars */}
          {totals.value > 0 && (
            <div className="card p-4">
              <p className="label-sm mb-3">Portfolio Allocation</p>
              <div className="flex flex-col gap-2.5">
                {[...holdings]
                  .map(h => {
                    const p = prices[h.symbol]
                    const mktVal = p && !p.error ? h.shares * p.price : null
                    const alloc = mktVal && totals.value > 0 ? (mktVal / totals.value) * 100 : 0
                    return { ...h, mktVal, alloc }
                  })
                  .sort((a, b) => b.alloc - a.alloc)
                  .map(h => (
                    <div key={h.id} className="flex items-center gap-3">
                      <span className="text-gold text-xs font-bold w-14 shrink-0">{h.symbol}</span>
                      <div className="flex-1 h-2 bg-surface3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${h.alloc}%`, background: 'linear-gradient(to right, #C9A96E80, #C9A96E)' }} />
                      </div>
                      <div className="w-28 text-right shrink-0">
                        <span className="text-cream text-xs font-num font-medium">{h.mktVal ? fmtCur(h.mktVal) : '—'}</span>
                        <span className="text-muted text-xs ml-2">{h.alloc.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
