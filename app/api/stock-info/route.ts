import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym = symbol.toUpperCase()
  const stooqSym = `${sym.toLowerCase()}.us`

  try {
    // Stooq for live price + prev close
    const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSym)}&f=sd2t2ohlcvp&h&e=csv`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    })

    if (!res.ok) throw new Error(`Stooq returned ${res.status}`)
    const text = await res.text()
    const lines = text.trim().split('\n')
    if (lines.length < 2) throw new Error('No data')

    const values = lines[1].split(',')
    if (values.length < 9) throw new Error('Unexpected format')

    const [, , , open, high, low, close, volume, prev] = values
    const price = parseFloat(close)
    const prevClose = parseFloat(prev)
    const change = price - prevClose
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0

    return NextResponse.json({
      symbol: sym,
      name: sym,
      currentPrice: price,
      change,
      changePct,
      marketCap: null,
      currency: 'USD',
      pe: null,
      forwardPE: null,
      dividendYield: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
      avgVolume: parseInt(volume) || null,
      revenueGrowth: null,
      grossMargins: null,
      targetMeanPrice: null,
      recommendationKey: null,
      beta: null,
      shortRatio: null,
      priceToBook: null,
      dayHigh: parseFloat(high) || null,
      dayLow: parseFloat(low) || null,
      open: parseFloat(open) || null,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
