export const dynamic = 'force-dynamic'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function decodeHtml(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function parseRSS(xml: string) {
  const items: { title: string; link: string; pubDate: string; source: string }[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = decodeHtml((block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || block.match(/<title>(.*?)<\/title>/) || [])[1] || '')
    const link = ((block.match(/<link>(.*?)<\/link>/) || block.match(/<feedburner:origLink>(.*?)<\/feedburner:origLink>/) || [])[1] || '').trim()
    const pubDate = ((block.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '').trim()
    const source = decodeHtml((block.match(/<source[^>]*>(.*?)<\/source>/) || [])[1] || '')
    if (title && link) items.push({ title, link, pubDate, source })
  }
  return items
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  if (!query) return Response.json({ articles: [] })

  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml, application/xml, text/xml, */*' },
    })
    if (!res.ok) return Response.json({ articles: [], error: `HTTP ${res.status}` })
    const xml = await res.text()
    const articles = parseRSS(xml).slice(0, 8)
    return Response.json({ articles })
  } catch (e) {
    return Response.json({ articles: [], error: String(e) })
  }
}
