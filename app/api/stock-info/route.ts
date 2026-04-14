import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const FINNHUB_KEY = process.env.FINNHUB_API_KEY!

// --- Stooq: current price ---
async function getStooqPrice(sym: string) {
  const url = `https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2t2ohlcvp&h&e=csv`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Stooq ${res.status}`)
  const text = await res.text()
  const lines = text.trim().split('\n')
  if (lines.length < 2) throw new Error('No stooq data')
  const v = lines[1].split(',')
  if (v.length < 9) throw new Error('Bad stooq format')
  const price = parseFloat(v[6])
  const prev = parseFloat(v[8])
  if (isNaN(price)) throw new Error('Invalid price')
  return {
    price,
    change: price - prev,
    changePct: prev > 0 ? (price - prev) / prev : 0,
    dayHigh: parseFloat(v[4]) || null,
    dayLow: parseFloat(v[5]) || null,
    open: parseFloat(v[3]) || null,
    volume: parseInt(v[7]) || null,
  }
}

// --- Finnhub: company profile (name, market cap) ---
async function getFinnhubProfile(sym: string) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${FINNHUB_KEY}`
    )
    if (!res.ok) return null
    const d = await res.json()
    return {
      name: d.name || null,
      marketCap: d.marketCapitalization ? d.marketCapitalization * 1_000_000 : null,
    }
  } catch { return null }
}

// --- Finnhub: basic financials (52W high/low, P/E, beta) ---
async function getFinnhubMetrics(sym: string) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/metric?symbol=${sym}&metric=all&token=${FINNHUB_KEY}`
    )
    if (!res.ok) return null
    const d = await res.json()
    const m = d.metric || {}
    return {
      fiftyTwoWeekHigh: m['52WeekHigh'] ?? null,
      fiftyTwoWeekLow: m['52WeekLow'] ?? null,
      pe: m.peTTM ?? null,
      beta: m.beta ?? null,
      dividendYield: m.dividendYieldIndicatedAnnual ?? null,
      revenueGrowth: m.revenueGrowthTTMYoy != null ? m.revenueGrowthTTMYoy / 100 : null,
      grossMargins: m.grossMarginTTM != null ? m.grossMarginTTM / 100 : null,
    }
  } catch { return null }
}

// --- Finnhub: analyst price target ---
async function getFinnhubTarget(sym: string) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/price-target?symbol=${sym}&token=${FINNHUB_KEY}`
    )
    if (!res.ok) return null
    const d = await res.json()
    return { targetMeanPrice: d.targetMean ?? null }
  } catch { return null }
}

// --- Finnhub: analyst recommendation ---
async function getFinnhubRec(sym: string) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/recommendation?symbol=${sym}&token=${FINNHUB_KEY}`
    )
    if (!res.ok) return null
    const d = await res.json()
    if (!Array.isArray(d) || d.length === 0) return null
    const latest = d[0]
    const buy = (latest.strongBuy || 0) + (latest.buy || 0)
    const hold = latest.hold || 0
    const sell = (latest.sell || 0) + (latest.strongSell || 0)
    const total = buy + hold + sell
    if (total === 0) return null
    const buyPct = buy / total
    const sellPct = sell / total
    let key = 'hold'
    if (buyPct >= 0.6) key = 'buy'
    else if (buyPct >= 0.75) key = 'strongBuy'
    else if (sellPct >= 0.5) key = 'sell'
    return { recommendationKey: key }
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const sym = symbol.toUpperCase()

  try {
    const [price, profile, metrics, target, rec] = await Promise.all([
      getStooqPrice(sym),
      getFinnhubProfile(sym),
      getFinnhubMetrics(sym),
      getFinnhubTarget(sym),
      getFinnhubRec(sym),
    ])

    return NextResponse.json({
      symbol: sym,
      name: profile?.name || sym,
      currentPrice: price.price,
      change: price.change,
      changePct: price.changePct,
      marketCap: profile?.marketCap ?? null,
      pe: metrics?.pe ?? null,
      forwardPE: null,
      fiftyTwoWeekHigh: metrics?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: metrics?.fiftyTwoWeekLow ?? null,
      beta: metrics?.beta ?? null,
      targetMeanPrice: target?.targetMeanPrice ?? null,
      recommendationKey: rec?.recommendationKey ?? null,
      dividendYield: metrics?.dividendYield ?? null,
      revenueGrowth: metrics?.revenueGrowth ?? null,
      grossMargins: metrics?.grossMargins ?? null,
      avgVolume: price.volume,
      dayHigh: price.dayHigh,
      dayLow: price.dayLow,
      open: price.open,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
