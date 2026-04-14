import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const FINNHUB_KEY = process.env.FINNHUB_API_KEY!

// Yahoo Finance v8 chart — handles 1H / 1D / 1W / 1M
async function getYahooChart(symbol: string, interval: string, range: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json',
      'Referer': 'https://finance.yahoo.com/',
    },
  })
  if (!res.ok) throw new Error(`Yahoo chart ${res.status}`)
  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) throw new Error('No Yahoo chart data')

  const timestamps: number[] = result.timestamp || []
  const q = result.indicators?.quote?.[0] || {}

  return timestamps
    .map((ts: number, i: number) => ({
      t: ts * 1000,
      c: q.close?.[i] ?? null,
      h: q.high?.[i] ?? null,
      l: q.low?.[i] ?? null,
      o: q.open?.[i] ?? null,
      v: q.volume?.[i] ?? null,
    }))
    .filter(p => p.c != null)
}

// Finnhub candle — handles 1Y / 5Y (daily/weekly, free tier OK)
async function getFinnhubChart(symbol: string, resolution: string, fromTs: number) {
  const now = Math.floor(Date.now() / 1000)
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTs}&to=${now}&token=${FINNHUB_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Finnhub ${res.status}`)
  const data = await res.json()
  if (data.s === 'no_data' || !Array.isArray(data.t)) throw new Error('No Finnhub data')

  return data.t.map((ts: number, i: number) => ({
    t: ts * 1000,
    c: data.c[i],
    h: data.h[i],
    l: data.l[i],
    o: data.o[i],
    v: data.v[i],
  }))
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  const period = req.nextUrl.searchParams.get('period') || '1D'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym = symbol.toUpperCase()
  const now = Math.floor(Date.now() / 1000)

  try {
    let points

    if (period === '1H') {
      // 5-min candles over 1 day, then slice to last 60 min of data
      const all = await getYahooChart(sym, '5m', '1d')
      points = all.slice(-12) // last ~60 minutes
    } else if (period === '1D') {
      points = await getYahooChart(sym, '5m', '1d')
    } else if (period === '1W') {
      points = await getYahooChart(sym, '1h', '5d')
    } else if (period === '1M') {
      points = await getYahooChart(sym, '1d', '1mo')
    } else if (period === '1Y') {
      // Try Yahoo first, fall back to Finnhub daily
      try {
        points = await getYahooChart(sym, '1d', '1y')
      } catch {
        points = await getFinnhubChart(sym, 'D', now - 365 * 86400)
      }
    } else if (period === '5Y') {
      // Try Yahoo first, fall back to Finnhub weekly
      try {
        points = await getYahooChart(sym, '1wk', '5y')
      } catch {
        points = await getFinnhubChart(sym, 'W', now - 5 * 365 * 86400)
      }
    } else {
      points = await getYahooChart(sym, '5m', '1d')
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
