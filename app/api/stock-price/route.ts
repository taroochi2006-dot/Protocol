import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Stooq.com free API — no key required, no rate limiting
// Format: s=symbol.us, f=fields (s=symbol,d2=date,t2=time,o=open,h=high,l=low,c=close,v=volume,p=prev)
async function fetchStooq(sym: string) {
  const stooqSym = sym.includes('.') ? sym.toLowerCase() : `${sym.toLowerCase()}.us`
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSym)}&f=sd2t2ohlcvp&h&e=csv`

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  })

  if (!res.ok) return null
  const text = await res.text()
  const lines = text.trim().split('\n')
  if (lines.length < 2) return null

  // Header: Symbol,Date,Time,Open,High,Low,Close,Volume,Prev
  const values = lines[1].split(',')
  if (values.length < 9) return null

  const [, , , open, high, low, close, volume, prev] = values
  const price = parseFloat(close)
  const prevClose = parseFloat(prev)

  if (isNaN(price) || price === 0) return null

  return {
    price,
    prevClose: isNaN(prevClose) ? price : prevClose,
    dayHigh: parseFloat(high) || null,
    dayLow: parseFloat(low) || null,
    volume: parseInt(volume) || null,
    open: parseFloat(open) || null,
  }
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym = symbol.toUpperCase()

  try {
    const data = await fetchStooq(sym)
    if (!data) throw new Error('No data')

    const { price, prevClose, dayHigh, dayLow, volume } = data
    const change = price - prevClose
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0

    return NextResponse.json({
      symbol: sym,
      name: sym,
      price,
      change,
      changePct,
      prevClose,
      dayHigh,
      dayLow,
      volume,
      marketCap: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
      currency: 'USD',
      marketState: null,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
