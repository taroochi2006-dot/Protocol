import { NextRequest, NextResponse } from 'next/server'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function fmt(d: Date) {
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// Stooq daily/weekly CSV → array of {t, o, h, l, c, v}
async function stooqDaily(sym: string, d1: Date, d2: Date, interval = 'd') {
  const url = `https://stooq.com/q/d/l/?s=${sym.toLowerCase()}.us&d1=${fmt(d1)}&d2=${fmt(d2)}&i=${interval}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Stooq ${res.status}`)
  const text = await res.text()
  const lines = text.trim().split('\n').slice(1) // skip header
  if (lines.length < 2) throw new Error('No stooq data')

  return lines
    .map(line => {
      const p = line.split(',')
      if (p.length < 5) return null
      const t = new Date(p[0]).getTime()
      if (isNaN(t)) return null
      return { t, o: +p[1], h: +p[2], l: +p[3], c: +p[4], v: +p[5] || 0 }
    })
    .filter(Boolean)
}

// Stooq intraday (5-min or hourly) — returns today/recent intraday candles
async function stooqIntraday(sym: string, interval: '5' | 'h') {
  const today = new Date()
  const d1 = daysAgo(3) // go back 3 days to cover weekends/gaps
  const url = `https://stooq.com/q/d/l/?s=${sym.toLowerCase()}.us&d1=${fmt(d1)}&d2=${fmt(today)}&i=${interval}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Stooq intraday ${res.status}`)
  const text = await res.text()
  const lines = text.trim().split('\n').slice(1)
  if (lines.length < 2) throw new Error('No intraday data')

  return lines
    .map(line => {
      const p = line.split(',')
      // Intraday CSV: Date, Time, Open, High, Low, Close, Volume
      if (p.length >= 7) {
        const t = new Date(`${p[0]}T${p[1]}`).getTime()
        if (isNaN(t)) return null
        return { t, o: +p[2], h: +p[3], l: +p[4], c: +p[5], v: +p[6] || 0 }
      }
      // Fallback: Date, Open, High, Low, Close, Volume (no time col)
      if (p.length >= 5) {
        const t = new Date(p[0]).getTime()
        if (isNaN(t)) return null
        return { t, o: +p[1], h: +p[2], l: +p[3], c: +p[4], v: +p[5] || 0 }
      }
      return null
    })
    .filter(Boolean)
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  const period  = req.nextUrl.searchParams.get('period') || '1D'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym = symbol.toUpperCase()
  const today = new Date()

  try {
    let points: { t: number; o: number; h: number; l: number; c: number; v: number }[] | null[] = []

    if (period === '1H') {
      // 5-min intraday, slice to last ~12 bars (60 min)
      const all = await stooqIntraday(sym, '5')
      points = all.slice(-12)
    } else if (period === '1D') {
      // Full day of 5-min bars
      points = await stooqIntraday(sym, '5')
      // Keep only today's bars (or latest session)
      const latestDay = points.length ? new Date((points[points.length - 1] as {t:number}).t).toDateString() : null
      if (latestDay) points = points.filter(p => new Date((p as {t:number}).t).toDateString() === latestDay)
    } else if (period === '1W') {
      points = await stooqDaily(sym, daysAgo(7), today)
    } else if (period === '1M') {
      points = await stooqDaily(sym, daysAgo(30), today)
    } else if (period === '1Y') {
      points = await stooqDaily(sym, daysAgo(365), today)
    } else if (period === '5Y') {
      points = await stooqDaily(sym, daysAgo(365 * 5), today, 'w') // weekly candles for 5Y
    }

    if (!points || points.length === 0) {
      return NextResponse.json({ error: 'No data for this period' }, { status: 404 })
    }

    return NextResponse.json({ points, period, symbol: sym })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
