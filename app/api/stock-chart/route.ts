import { NextRequest, NextResponse } from 'next/server'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// Yahoo Finance v8 chart — no API key needed
async function yahooChart(symbol: string, interval: string, range: string, revalidate: number) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json',
      'Referer': 'https://finance.yahoo.com/',
    },
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`Yahoo ${res.status}`)
  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) throw new Error('No data')

  const timestamps: number[] = result.timestamp || []
  const q = result.indicators?.quote?.[0] || {}

  return timestamps
    .map((ts: number, i: number) => {
      const c = q.close?.[i]
      if (c == null || isNaN(c)) return null
      return {
        t: ts * 1000,
        o: q.open?.[i]   ?? c,
        h: q.high?.[i]   ?? c,
        l: q.low?.[i]    ?? c,
        c,
        v: q.volume?.[i] ?? 0,
      }
    })
    .filter(Boolean)
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  const period  = req.nextUrl.searchParams.get('period') || '1M'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym = symbol.toUpperCase()

  // period → [interval, range, cache-seconds]
  const config: Record<string, [string, string, number]> = {
    '1D': ['5m',  '1d',  300],
    '1W': ['1h',  '5d',  1800],
    '1M': ['1d',  '1mo', 3600],
    '3M': ['1d',  '3mo', 3600],
    '1Y': ['1d',  '1y',  86400],
    '5Y': ['1wk', '5y',  86400],
  }

  const [interval, range, revalidate] = config[period] ?? config['1M']

  try {
    let points = await yahooChart(sym, interval, range, revalidate)

    // For 1D: keep only today's session (or last session)
    if (period === '1D' && points.length > 0) {
      const lastDay = new Date((points[points.length - 1] as {t:number}).t).toDateString()
      const todayPoints = points.filter(p => new Date((p as {t:number}).t).toDateString() === lastDay)
      if (todayPoints.length > 0) points = todayPoints
    }

    if (points.length === 0) {
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
