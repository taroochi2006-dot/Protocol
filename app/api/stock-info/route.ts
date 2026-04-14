import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// --- Stooq current quote ---
async function getStooqPrice(sym: string) {
  const stooqSym = `${sym.toLowerCase()}.us`
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSym)}&f=sd2t2ohlcvp&h&e=csv`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Stooq ${res.status}`)
  const text = await res.text()
  const lines = text.trim().split('\n')
  if (lines.length < 2) throw new Error('No data from stooq')
  const vals = lines[1].split(',')
  if (vals.length < 9) throw new Error('Unexpected stooq format')
  const [, , , open, high, low, close, volume, prev] = vals
  const price = parseFloat(close)
  const prevClose = parseFloat(prev)
  if (isNaN(price)) throw new Error('Invalid price')
  return {
    price,
    prevClose,
    change: price - prevClose,
    changePct: prevClose > 0 ? (price - prevClose) / prevClose : 0,
    dayHigh: parseFloat(high) || null,
    dayLow: parseFloat(low) || null,
    open: parseFloat(open) || null,
    volume: parseInt(volume) || null,
  }
}

// --- Stooq 1-year historical → 52W high/low ---
async function getStooq52W(sym: string) {
  try {
    const stooqSym = `${sym.toLowerCase()}.us`
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
    const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSym)}&d1=${fmt(oneYearAgo)}&d2=${fmt(today)}&i=d`

    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      next: { revalidate: 86400 }, // cache 24h
    })
    if (!res.ok) return null
    const text = await res.text()
    const lines = text.trim().split('\n').slice(1) // skip header row
    if (lines.length < 5) return null

    let high52 = -Infinity
    let low52 = Infinity

    for (const line of lines) {
      const parts = line.split(',')
      // CSV: Date, Open, High, Low, Close, Volume
      if (parts.length >= 5) {
        const h = parseFloat(parts[2])
        const l = parseFloat(parts[3])
        if (!isNaN(h) && h > high52) high52 = h
        if (!isNaN(l) && l < low52) low52 = l
      }
    }

    return {
      fiftyTwoWeekHigh: high52 > -Infinity ? high52 : null,
      fiftyTwoWeekLow: low52 < Infinity ? low52 : null,
    }
  } catch {
    return null
  }
}

// --- Yahoo Finance v7 quote → P/E, market cap, beta, analyst target ---
async function getYahooFundamentals(sym: string) {
  try {
    const fields = [
      'longName', 'shortName', 'marketCap', 'trailingPE', 'forwardPE',
      'beta', 'targetMeanPrice', 'recommendationKey',
      'dividendYield', 'revenueGrowth', 'grossMargins',
    ].join(',')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${sym}&fields=${fields}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com',
      },
      next: { revalidate: 3600 }, // cache 1h
    })
    if (!res.ok) return null
    const data = await res.json()
    const q = data?.quoteResponse?.result?.[0]
    if (!q) return null
    return {
      name: q.longName || q.shortName || null,
      marketCap: q.marketCap || null,
      pe: q.trailingPE || null,
      forwardPE: q.forwardPE || null,
      beta: q.beta || null,
      targetMeanPrice: q.targetMeanPrice || null,
      recommendationKey: q.recommendationKey || null,
      dividendYield: q.dividendYield || null,
      revenueGrowth: q.revenueGrowth || null,
      grossMargins: q.grossMargins || null,
    }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym = symbol.toUpperCase()

  try {
    // Fire all three sources in parallel
    const [priceData, w52, fundamentals] = await Promise.all([
      getStooqPrice(sym),
      getStooq52W(sym),
      getYahooFundamentals(sym),
    ])

    return NextResponse.json({
      symbol: sym,
      name: fundamentals?.name || sym,
      currentPrice: priceData.price,
      change: priceData.change,
      changePct: priceData.changePct,
      marketCap: fundamentals?.marketCap ?? null,
      pe: fundamentals?.pe ?? null,
      forwardPE: fundamentals?.forwardPE ?? null,
      fiftyTwoWeekHigh: w52?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: w52?.fiftyTwoWeekLow ?? null,
      beta: fundamentals?.beta ?? null,
      targetMeanPrice: fundamentals?.targetMeanPrice ?? null,
      recommendationKey: fundamentals?.recommendationKey ?? null,
      dividendYield: fundamentals?.dividendYield ?? null,
      revenueGrowth: fundamentals?.revenueGrowth ?? null,
      grossMargins: fundamentals?.grossMargins ?? null,
      avgVolume: priceData.volume,
      dayHigh: priceData.dayHigh,
      dayLow: priceData.dayLow,
      open: priceData.open,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
