'use client'
import { useState, useEffect, useRef } from 'react'
import { RefreshCw, ExternalLink, TrendingUp, TrendingDown, Search, X } from 'lucide-react'
import { getStockOfTheDay, STOCKS_LIST } from '@/lib/stocks-list'
import { AUTOCOMPLETE_EXTRA, StockSuggestion } from '@/lib/stocks-autocomplete'
import StockChart from '@/app/components/StockChart'

// Combined autocomplete pool: STOCKS_LIST entries + extra list
const AUTOCOMPLETE_POOL: StockSuggestion[] = [
  ...STOCKS_LIST.map(s => ({ symbol: s.symbol, name: s.name, sector: s.sector })),
  ...AUTOCOMPLETE_EXTRA.filter(e => !STOCKS_LIST.some(s => s.symbol === e.symbol)),
]

interface NewsArticle {
  uuid: string; title: string; publisher: string; link: string
  publishedAt: string | null; thumbnail: string | null; relatedTickers: string[]
}
interface StockInfo {
  symbol: string; name: string; currentPrice: number; change: number; changePct: number
  marketCap: number | null; pe: number | null; forwardPE: number | null
  fiftyTwoWeekHigh: number | null; fiftyTwoWeekLow: number | null
  dividendYield: number | null; beta: number | null; revenueGrowth: number | null
  grossMargins: number | null; targetMeanPrice: number | null; recommendationKey: string | null
  error?: string
}

function timeAgo(iso: string | null) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function fmtCur(n: number | null) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
function fmtPct(n: number | null) {
  if (n == null) return '—'
  return `${(n * 100).toFixed(2)}%`
}
function fmtBig(n: number | null) {
  if (n == null) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return fmtCur(n)
}

const REC_COLORS: Record<string, string> = {
  strongBuy: '#5DB87A', buy: '#8FD4A4',
  hold: '#C9A96E',
  underperform: '#E8A44A', sell: '#D95F5F', strongSell: '#D95F5F',
}

export default function StocksPage() {
  const today = new Date()
  const sotd = getStockOfTheDay(today)
  const [sotdInfo, setSotdInfo] = useState<StockInfo | null>(null)
  const [sotdLoading, setSotdLoading] = useState(true)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<StockInfo | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Date-based seed for deterministic SOTD display
  const sotdIndex = (() => {
    const start = new Date(today.getFullYear(), 0, 0)
    const diff = today.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24)) % STOCKS_LIST.length
  })()

  useEffect(() => {
    fetch(`/api/stock-info?symbol=${sotd.symbol}`)
      .then(r => r.json())
      .then(d => { setSotdInfo(d); setSotdLoading(false) })
      .catch(() => setSotdLoading(false))
  }, [sotd.symbol])

  useEffect(() => {
    fetch('/api/stock-news')
      .then(r => r.json())
      .then(d => { setNews(d.articles || []); setNewsLoading(false) })
      .catch(() => setNewsLoading(false))
  }, [])

  function updateSuggestions(val: string) {
    const upper = val.toUpperCase().trim()
    if (!upper) { setSuggestions([]); setShowSuggestions(false); return }
    const symbolMatches = AUTOCOMPLETE_POOL.filter(s => s.symbol.startsWith(upper))
    const nameMatches = AUTOCOMPLETE_POOL.filter(
      s => !s.symbol.startsWith(upper) && s.name.toLowerCase().includes(upper.toLowerCase())
    )
    const combined = [...symbolMatches, ...nameMatches].slice(0, 8)
    setSuggestions(combined)
    setShowSuggestions(combined.length > 0)
    setActiveSuggestion(-1)
  }

  async function handleSearchWithSym(sym: string) {
    if (!sym) return
    setShowSuggestions(false)
    setSuggestions([])
    setSearching(true)
    setSearchError('')
    try {
      const r = await fetch(`/api/stock-info?symbol=${sym}`)
      const d = await r.json()
      if (d.error) { setSearchError(`Could not find data for "${sym}"`); setSearchResult(null) }
      else setSearchResult(d)
    } catch {
      setSearchError('Search failed. Please try again.')
    }
    setSearching(false)
  }

  async function handleSearch() {
    await handleSearchWithSym(search.trim().toUpperCase())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSearch()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeSuggestion >= 0) {
        const s = suggestions[activeSuggestion]
        setSearch(s.symbol)
        handleSearchWithSym(s.symbol)
      } else {
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const upPct = sotdInfo && sotdInfo.fiftyTwoWeekHigh && sotdInfo.currentPrice
    ? ((sotdInfo.fiftyTwoWeekHigh - sotdInfo.currentPrice) / sotdInfo.currentPrice) * 100
    : null

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 border-b border-gold-border pb-5">
        <p className="label-sm mb-1">Protocol — Market Intelligence</p>
        <h2 className="text-cream text-2xl font-light tracking-wide">Stocks & Market News</h2>
      </div>

      {/* Search */}
      <div className="mb-6 card p-4">
        <p className="label-sm mb-3">Lookup Any Stock</p>
        <div className="flex gap-2 relative" ref={searchRef}>
          <div className="relative flex-1">
            <input
              className="input-base w-full uppercase"
              placeholder="Ticker or company name (e.g. AAPL, Apple, NVDA)"
              value={search}
              onChange={e => { setSearch(e.target.value.toUpperCase()); updateSuggestions(e.target.value) }}
              onKeyDown={handleKeyDown}
              onFocus={() => search && setShowSuggestions(suggestions.length > 0)}
              autoComplete="off"
            />
            {/* Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-gold-border bg-surface shadow-xl overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={s.symbol}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface2 transition-colors ${i === activeSuggestion ? 'bg-surface2' : ''}`}
                    onMouseDown={e => { e.preventDefault(); setSearch(s.symbol); handleSearchWithSym(s.symbol) }}
                  >
                    <span className="text-gold font-bold text-sm w-14 shrink-0">{s.symbol}</span>
                    <span className="text-cream text-xs flex-1 truncate">{s.name}</span>
                    <span className="text-muted text-xs shrink-0">{s.sector}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn-gold flex items-center gap-1.5 shrink-0" onClick={handleSearch} disabled={searching}>
            {searching ? <RefreshCw size={12} className="animate-spin" /> : <Search size={12} />}
            Search
          </button>
        </div>
        {searchError && <p className="text-negative text-xs mt-2">{searchError}</p>}

        {searchResult && !searchResult.error && (
          <div className="mt-4 border-t border-gold-border pt-4 animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-gold text-xl font-bold">{searchResult.symbol}</h3>
                  <span className="text-cream text-sm">{searchResult.name}</span>
                </div>
              </div>
              <button onClick={() => { setSearchResult(null); setSearch('') }} className="text-muted hover:text-cream">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-cream text-2xl font-bold font-num">{fmtCur(searchResult.currentPrice)}</span>
              <div className={`flex items-center gap-1 ${searchResult.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                {searchResult.changePct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="font-num">{searchResult.changePct >= 0 ? '+' : ''}{(searchResult.changePct * 100).toFixed(2)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Market Cap', val: fmtBig(searchResult.marketCap) },
                { label: 'P/E Ratio', val: searchResult.pe ? searchResult.pe.toFixed(2) : '—' },
                { label: '52W High', val: fmtCur(searchResult.fiftyTwoWeekHigh) },
                { label: '52W Low', val: fmtCur(searchResult.fiftyTwoWeekLow) },
                { label: 'Beta', val: searchResult.beta ? searchResult.beta.toFixed(2) : '—' },
                { label: 'Div Yield', val: fmtPct(searchResult.dividendYield) },
                { label: 'Rev Growth', val: fmtPct(searchResult.revenueGrowth) },
                { label: 'Analyst Target', val: fmtCur(searchResult.targetMeanPrice) },
              ].map(({ label, val }) => (
                <div key={label} className="bg-surface2 rounded p-2.5">
                  <p className="label-sm">{label}</p>
                  <p className="text-cream font-num text-sm mt-0.5">{val}</p>
                </div>
              ))}
            </div>
            {searchResult.recommendationKey && (
              <div className="mt-3 flex items-center gap-2">
                <p className="label-sm">Analyst Consensus:</p>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium uppercase"
                  style={{
                    background: `${REC_COLORS[searchResult.recommendationKey] || '#888'}20`,
                    color: REC_COLORS[searchResult.recommendationKey] || '#888',
                    border: `1px solid ${REC_COLORS[searchResult.recommendationKey] || '#888'}40`,
                  }}
                >
                  {searchResult.recommendationKey.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            )}

            <StockChart symbol={searchResult.symbol} currentPrice={searchResult.currentPrice} />
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Stock of the Day — takes more space */}
        <div className="md:col-span-2">
          <div className="card p-5 corner-mark h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="label-sm mb-1">Stock of the Day</p>
                <p className="text-muted text-xs">#{String(sotdIndex + 1).padStart(3, '0')} · Rotates daily</p>
              </div>
              {sotdInfo?.currentPrice && (
                <div className="text-right">
                  <p className="text-cream font-bold font-num text-lg">{fmtCur(sotdInfo.currentPrice)}</p>
                  <p className={`text-xs font-num ${(sotdInfo.changePct ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {(sotdInfo.changePct ?? 0) >= 0 ? '+' : ''}{((sotdInfo.changePct ?? 0) * 100).toFixed(2)}%
                  </p>
                </div>
              )}
            </div>

            <div className="mb-3">
              <h3 className="text-gold text-3xl font-bold tracking-widest">{sotd.symbol}</h3>
              <p className="text-cream text-sm mt-0.5">{sotd.name}</p>
              <p className="text-muted text-xs mt-0.5">{sotd.sector} · {sotd.industry}</p>
              {sotd.hq && <p className="text-muted text-xs">📍 {sotd.hq}{sotd.founded ? ` · Est. ${sotd.founded}` : ''}</p>}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {sotd.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-gold-border text-gold bg-gold-dim">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mb-4">
              <p className="label-sm mb-1.5">About</p>
              <p className="text-muted-light text-xs leading-relaxed">{sotd.description}</p>
            </div>

            <div className="mb-4 bg-surface2 rounded p-3 border border-gold-border">
              <p className="label-sm mb-1.5">Why Watch</p>
              <p className="text-cream text-xs leading-relaxed">{sotd.whyWatch}</p>
            </div>

            {sotdInfo && !sotdInfo.error && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Market Cap', val: fmtBig(sotdInfo.marketCap) },
                  { label: 'P/E Ratio', val: sotdInfo.pe ? sotdInfo.pe.toFixed(1) : '—' },
                  { label: '52W High', val: fmtCur(sotdInfo.fiftyTwoWeekHigh) },
                  { label: '52W Low', val: fmtCur(sotdInfo.fiftyTwoWeekLow) },
                  { label: 'Beta', val: sotdInfo.beta ? sotdInfo.beta.toFixed(2) : '—' },
                  { label: 'Analyst Target', val: fmtCur(sotdInfo.targetMeanPrice) },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-surface2 rounded p-2">
                    <p className="label-sm">{label}</p>
                    <p className="text-cream font-num text-xs mt-0.5">{val}</p>
                  </div>
                ))}
                {upPct != null && upPct > 0 && (
                  <div className="col-span-2 bg-gold-dim border border-gold-border rounded p-2">
                    <p className="label-sm">Upside to 52W High</p>
                    <p className="text-gold font-num text-sm mt-0.5">+{upPct.toFixed(1)}%</p>
                  </div>
                )}
                {sotdInfo.recommendationKey && (
                  <div className="col-span-2 flex items-center gap-2">
                    <p className="label-sm">Consensus:</p>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider"
                      style={{
                        background: `${REC_COLORS[sotdInfo.recommendationKey] || '#888'}20`,
                        color: REC_COLORS[sotdInfo.recommendationKey] || '#888',
                        border: `1px solid ${REC_COLORS[sotdInfo.recommendationKey] || '#888'}40`,
                      }}
                    >
                      {sotdInfo.recommendationKey.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {sotdLoading && (
              <div className="flex items-center gap-2 text-muted text-xs animate-pulse-gold">
                <RefreshCw size={12} className="animate-spin" />
                Loading live data...
              </div>
            )}

            <StockChart symbol={sotd.symbol} currentPrice={sotdInfo?.currentPrice} />
          </div>
        </div>

        {/* News feed */}
        <div className="md:col-span-3">
          <div className="card overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gold-border flex items-center justify-between">
              <p className="label-sm">Market News</p>
              <button
                className="text-muted hover:text-gold transition-colors"
                onClick={() => {
                  setNewsLoading(true)
                  fetch('/api/stock-news')
                    .then(r => r.json())
                    .then(d => { setNews(d.articles || []); setNewsLoading(false) })
                    .catch(() => setNewsLoading(false))
                }}
              >
                <RefreshCw size={13} className={newsLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ maxHeight: '680px' }}>
              {newsLoading ? (
                <div className="p-6 text-center">
                  <RefreshCw size={20} className="text-gold mx-auto mb-2 animate-spin" />
                  <p className="text-muted text-sm">Loading news...</p>
                </div>
              ) : news.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted text-sm">No news available</p>
                </div>
              ) : (
                <div className="divide-y divide-gold-border">
                  {news.map((article, i) => (
                    <a
                      key={article.uuid || i}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 p-3.5 hover:bg-surface2 transition-colors group"
                    >
                      {article.thumbnail && (
                        <img
                          src={article.thumbnail}
                          alt=""
                          className="w-16 h-12 rounded object-cover shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-cream text-xs font-medium leading-relaxed line-clamp-2 group-hover:text-gold transition-colors mb-1">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-muted text-xs">{article.publisher}</span>
                          {article.publishedAt && (
                            <span className="text-muted text-xs">· {timeAgo(article.publishedAt)}</span>
                          )}
                          {article.relatedTickers?.slice(0, 3).map(t => (
                            <span key={t} className="text-gold text-xs bg-gold-dim px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-muted group-hover:text-gold shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming SOTD preview */}
      <div className="mt-4 card p-4">
        <p className="label-sm mb-3">Coming Up — Stock Education Queue</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map(offset => {
            const futureDate = new Date(today)
            futureDate.setDate(futureDate.getDate() + offset)
            const stock = getStockOfTheDay(futureDate)
            return (
              <div key={offset} className="shrink-0 bg-surface2 border border-gold-border rounded p-2.5 w-32">
                <p className="text-muted text-xs mb-1">
                  {futureDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-gold font-bold text-sm">{stock.symbol}</p>
                <p className="text-cream text-xs truncate">{stock.name}</p>
                <p className="text-muted text-xs">{stock.sector}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
