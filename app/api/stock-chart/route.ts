import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TD_KEY = process.env.TWELVEDATA_API_KEY!

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  const period  = req.nextUrl.searchParams.get('period') || '1M'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym = symbol.toUpperCase()

  // period → [interval, outputsize]
  const config: Record<string, [string, number]> = {
    '1D':  ['5min',   78],
    '1W':  ['1h',     35],
    '1M':  ['1day',   23],
    '3M':  ['1day',   66],
    '1Y':  ['1day',  253],
    '5Y':  ['1week', 261],
    'ALL': ['1month', 480], // up to 40 years of monthly candles
  }

  const [interval, outputsize] = config[period] ?? config['1M']

  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${sym}&interval=${interval}&outputsize=${outputsize}&apikey=${TD_KEY}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Twelve Data ${res.status}`)

    const data = await res.json()

    if (data.status === 'error') throw new Error(data.message || 'Twelve Data error')
    if (!Array.isArray(data.values) || data.values.length === 0) {
      return NextResponse.json({ error: 'No data for this period' }, { status: 404 })
    }

    // Twelve Data returns newest-first — reverse to chronological order
    const points = data.values
      .reverse()
      .map((v: { datetime: string; open: string; high: string; low: string; close: string; volume: string }) => ({
        t: new Date(v.datetime).getTime(),
        o: parseFloat(v.open),
        h: parseFloat(v.high),
        l: parseFloat(v.low),
        c: parseFloat(v.close),
        v: parseInt(v.volume) || 0,
      }))
      .filter((p: { c: number }) => !isNaN(p.c))

    return NextResponse.json({ points, period, symbol: sym })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
