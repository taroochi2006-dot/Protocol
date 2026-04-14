'use client'
import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface ChartPoint { t: number; c: number; h: number; l: number; o: number; v: number }

const PERIODS = ['1W', '1M', '3M', '1Y', '5Y'] as const
type Period = typeof PERIODS[number]

function formatLabel(ts: number, period: Period) {
  const d = new Date(ts)
  if (period === '1W' || period === '1M' || period === '3M') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function fmtPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

interface Props {
  symbol: string
  currentPrice?: number
}

export default function StockChart({ symbol, currentPrice }: Props) {
  const [period, setPeriod] = useState<Period>('1M')
  const [points, setPoints] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hovered, setHovered] = useState<ChartPoint | null>(null)

  useEffect(() => {
    if (!symbol) return
    setLoading(true)
    setError('')
    setPoints([])
    fetch(`/api/stock-chart?symbol=${symbol}&period=${period}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setPoints(d.points || [])
      })
      .catch(() => setError('Failed to load chart'))
      .finally(() => setLoading(false))
  }, [symbol, period])

  const first = points[0]?.c ?? null
  const last = points[points.length - 1]?.c ?? currentPrice ?? null
  const displayPrice = hovered?.c ?? last
  const isUp = first != null && last != null ? last >= first : true
  const color = isUp ? '#5DB87A' : '#D95F5F'
  const gradId = `grad-${symbol.replace('.', '')}`

  const periodChange = first != null && last != null
    ? { abs: last - first, pct: ((last - first) / first) * 100 }
    : null

  const yMin = points.length ? Math.min(...points.map(p => p.l)) * 0.998 : 'auto'
  const yMax = points.length ? Math.max(...points.map(p => p.h)) * 1.002 : 'auto'

  return (
    <div className="mt-4">
      {/* Price header */}
      <div className="flex items-end justify-between mb-3">
        <div>
          {displayPrice != null && (
            <p className="text-cream font-bold font-num text-xl">
              {fmtPrice(displayPrice)}
            </p>
          )}
          {periodChange && !hovered && (
            <p className={`text-xs font-num mt-0.5 ${isUp ? 'text-positive' : 'text-negative'}`}>
              {isUp ? '+' : ''}{fmtPrice(periodChange.abs)} ({isUp ? '+' : ''}{periodChange.pct.toFixed(2)}%) {period}
            </p>
          )}
          {hovered && (
            <p className="text-muted text-xs mt-0.5">
              {formatLabel(hovered.t, period)}
            </p>
          )}
        </div>

        {/* Period selector */}
        <div className="flex gap-0.5">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
                period === p
                  ? 'bg-gold text-surface'
                  : 'text-muted hover:text-cream hover:bg-surface2'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-44 flex items-center justify-center">
          <RefreshCw size={16} className="text-gold animate-spin" />
        </div>
      ) : error ? (
        <div className="h-44 flex items-center justify-center">
          <p className="text-muted text-xs">{error}</p>
        </div>
      ) : points.length === 0 ? (
        <div className="h-44 flex items-center justify-center">
          <p className="text-muted text-xs">No data for this period</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={176}>
          <AreaChart
            data={points}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="t"
              tickFormatter={ts => formatLabel(ts, period)}
              tick={{ fill: '#666', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={55}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fill: '#666', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={v => `$${Number(v).toFixed(0)}`}
              orientation="right"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const pt = payload[0].payload as ChartPoint
                  if (hovered?.t !== pt.t) setHovered(pt)
                  return (
                    <div className="bg-surface border border-gold-border rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-cream font-num font-bold text-sm">{fmtPrice(pt.c)}</p>
                      <p className="text-muted text-xs mt-0.5">{formatLabel(pt.t, period)}</p>
                      <div className="flex gap-3 mt-1.5 text-xs text-muted">
                        <span>H: <span className="text-cream font-num">{fmtPrice(pt.h)}</span></span>
                        <span>L: <span className="text-cream font-num">{fmtPrice(pt.l)}</span></span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 2' }}
            />
            {first != null && (
              <ReferenceLine
                y={first}
                stroke="#444"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
            <Area
              type="monotone"
              dataKey="c"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: '#1a1a1a', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={400}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
