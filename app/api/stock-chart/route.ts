import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FINNHUB_KEY = process.env.FINNHUB_API_KEY!

async function finnhubCandles(symbol: string, resolution: string, fromTs: number) {
  const now = Math.floor(Date.now() / 1000)
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTs}&to=${now}&token=${FINNHUB_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Finnhub ${res.status}`)
  const data = await res.json()
  if (data.s === 'no_data' || !Array.isArray(data.t) || data.t.length === 0) {
    throw new Error('No data')
  }
  return data.t.map((ts: number, i: number) => ({
    t: ts * 1000,
    o: data.o[i],
    h: data.h[i],
    l: data.l[i],
    c: data.c[i],
    v: data.v[i],
  }))
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  const period  = req.nextUrl.searchParams.get('period') || '1M'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym = symbol.toUpperCase()
  const now = Math.floor(Date.now() / 1000)

  const periodMap: Record<string, { resolution: string; from: number }> = {
    '1W': { resolution: 'D', from: now - 7   * 86400 },
    '1M': { resolution: 'D', from: now - 30  * 86400 },
    '3M': { resolution: 'D', from: now - 90  * 86400 },
    '1Y': { resolution: 'D', from: now - 365 * 86400 },
    '5Y': { resolution: 'W', from: now - 5 * 365 * 86400 },
  }

  const config = periodMap[period] ?? periodMap['1M']

  try {
    const points = await finnhubCandles(sym, config.resolution, config.from)
    return NextResponse.json({ points, period, symbol: sym })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
