import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function fmt(d: Date) {
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function stooqCandles(sym: string, d1: Date, d2: Date, interval: string) {
  const s = `${sym.toLowerCase()}.us`
  const url = `https://stooq.com/q/d/l/?s=${s}&d1=${fmt(d1)}&d2=${fmt(d2)}&i=${interval}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Stooq ${res.status}`)
  const text = await res.text()

  // Strip \r, split on \n, skip header row, drop blanks
  const lines = text
    .replace(/\r/g, '')
    .trim()
    .split('\n')
    .slice(1)
    .filter(l => l.trim().length > 0)

  if (lines.length === 0) throw new Error('No stooq data')

  const points = lines.map(line => {
    const p = line.trim().split(',')
    // Stooq daily:    Date, Open, High, Low, Close, Volume
    // Stooq intraday: Date, Time, Open, High, Low,  Close, Volume
    const hasTime = p.length >= 7

    const dateStr  = p[0].trim()
    const timeStr  = hasTime ? p[1].trim() : '00:00:00'
    const openIdx  = hasTime ? 2 : 1
    const highIdx  = hasTime ? 3 : 2
    const lowIdx   = hasTime ? 4 : 3
    const closeIdx = hasTime ? 5 : 4
    const volIdx   = hasTime ? 6 : 5

    const t = new Date(`${dateStr}T${timeStr}`).getTime()
    if (isNaN(t)) return null

    const c = parseFloat(p[closeIdx])
    if (isNaN(c)) return null

    return {
      t,
      o: parseFloat(p[openIdx])  || c,
      h: parseFloat(p[highIdx])  || c,
      l: parseFloat(p[lowIdx])   || c,
      c,
      v: parseInt(p[volIdx])     || 0,
    }
  }).filter(Boolean)

  return points
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  const period  = req.nextUrl.searchParams.get('period') || '1D'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym   = symbol.toUpperCase()
  const today = new Date()

  try {
    let points

    if (period === '1H') {
      // Try 5-min intraday; slice to last ~12 bars (~60 min)
      const all = await stooqCandles(sym, daysAgo(3), today, '5')
      points = all.slice(-12)
    } else if (period === '1D') {
      // Full intraday session (5-min bars, last 3 days to cover gaps)
      const all = await stooqCandles(sym, daysAgo(3), today, '5')
      // Keep only the most recent trading session
      if (all.length > 0) {
        const lastDate = new Date((all[all.length - 1] as {t:number}).t).toDateString()
        points = all.filter(p => new Date((p as {t:number}).t).toDateString() === lastDate)
      } else {
        points = all
      }
    } else if (period === '1W') {
      points = await stooqCandles(sym, daysAgo(7),       today, 'd')
    } else if (period === '1M') {
      points = await stooqCandles(sym, daysAgo(30),      today, 'd')
    } else if (period === '1Y') {
      points = await stooqCandles(sym, daysAgo(365),     today, 'd')
    } else if (period === '5Y') {
      points = await stooqCandles(sym, daysAgo(365 * 5), today, 'w')
    } else {
      points = await stooqCandles(sym, daysAgo(30),      today, 'd')
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
