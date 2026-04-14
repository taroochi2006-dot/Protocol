import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RSS_FEEDS = [
  'https://feeds.content.dowjones.io/public/rss/mw_topstories',
  'https://feeds.content.dowjones.io/public/rss/mw_marketpulse',
]

function parseRSS(xml: string) {
  const items: {
    uuid: string
    title: string
    publisher: string
    link: string
    publishedAt: string | null
    thumbnail: string | null
    relatedTickers: string[]
    summary: string | null
  }[] = []

  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

  for (const match of itemMatches) {
    const item = match[1]

    const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      ?.replace(/&amp;/g, '&')
      ?.replace(/&#x[\dA-Fa-f]+;/g, c => String.fromCodePoint(parseInt(c.slice(3, -1), 16)))
      ?.trim()

    const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim()
      || item.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/)?.[1]?.trim()

    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim()

    const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      ?.replace(/<[^>]+>/g, '')
      ?.replace(/&amp;/g, '&')
      ?.replace(/&#x[\dA-Fa-f]+;/g, c => String.fromCodePoint(parseInt(c.slice(3, -1), 16)))
      ?.replace(/&#\d+;/g, c => String.fromCodePoint(parseInt(c.slice(2, -1))))
      ?.trim()

    const thumbnail = item.match(/<media:content[^>]*url="([^"]+)"[^>]*>/)?.[1] || null

    const guid = item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1]?.trim()
      || link || Math.random().toString(36).slice(2)

    if (!title || !link) continue

    items.push({
      uuid: guid,
      title,
      publisher: 'MarketWatch',
      link,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
      thumbnail,
      relatedTickers: [],
      summary: description || null,
    })
  }

  return items
}

export async function GET() {
  try {
    const feedUrl = RSS_FEEDS[0]
    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    })

    if (!res.ok) throw new Error(`Feed returned ${res.status}`)
    const xml = await res.text()
    const articles = parseRSS(xml).slice(0, 20)

    return NextResponse.json({ articles })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg, articles: [] }, { status: 500 })
  }
}
