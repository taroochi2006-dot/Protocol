import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FINNHUB_KEY = process.env.FINNHUB_API_KEY!

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  const period = req.nextUrl.searchParams.get('period') || '1D'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const now = Math.floor(Date.now() / 1000)

  // Map period → Finnhub resolution + from-timestamp
  const config: Record<string, { resolution: string; from: number }> = {
    '1H': { resolution: '5',  from: now - 3_600 },
    '1D': { resolution: '5',  from: now - 86_400 },
    '1W': { resolution: '60', from: now - 7 * 86_400 },
    '1M': { resolution: 'D',  from: now - 30 * 86_400 },
    '1Y': { resolution: 'D',  from: now - 365 * 86_400 },
    '5Y': { resolution: 'W',  from: now - 5 * 365 * 86_400 },
  }

  const { resolution, from } = config[period] ?? config['1D']

  try {
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol.toUpperCase()}&resolution=${resolution}&from=${from}&to=${now}&token=${FINNHUB_KEY}`
    const res = await fetch(url)
    if (!res.ok) return NextResponse.json({ error: `Finnhub ${res.status}` }, { status: 500 })

    const data = await res.json()

    if (data.s === 'no_data' || !Array.isArray(data.t) || data.t.length === 0) {
      return NextResponse.json({ error: 'No chart data available' }, { status: 404 })
    }

    const points = data.t.map((ts: number, i: number) => ({
      t: ts * 1000, // → ms for JS Date
      c: data.c[i],
      h: data.h[i],
      l: data.l[i],
      o: data.o[i],
      v: data.v[i],
    }))

    return NextResponse.json({ points, period, symbol: symbol.toUpperCase() })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 })
  }
}
