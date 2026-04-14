export const dynamic = 'force-dynamic'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function decodeHtml(str: string) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
}

function parseRSS(xml: string) {
  const items: { title: string; link: string; pubDate: string; source: string; image: string; description: string }[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]

    const title = decodeHtml(
      (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || block.match(/<title>(.*?)<\/title>/) || [])[1] || ''
    )

    // Bing RSS: real article URL is in the `url=` query param of the link
    const rawLink = decodeHtml(((block.match(/<link>(.*?)<\/link>/) || [])[1] || '').trim())
    const urlParam = rawLink.match(/[?&]url=(https?[^&]+)/i)
    const link = urlParam
      ? decodeURIComponent(urlParam[1])
      : rawLink

    const pubDate = ((block.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '').trim()

    const source = decodeHtml(
      (block.match(/<News:Source>(.*?)<\/News:Source>/) ||
       block.match(/<source[^>]*>(.*?)<\/source>/) || [])[1] || ''
    )

    // Bing RSS: thumbnail in <News:Image> — request max resolution
    const bingImage = (block.match(/<News:Image>(.*?)<\/News:Image>/) || [])[1] || ''
    const maxW = (block.match(/<News:ImageMaxWidth>(\d+)<\/News:ImageMaxWidth>/) || [])[1] || '800'
    const maxH = (block.match(/<News:ImageMaxHeight>(\d+)<\/News:ImageMaxHeight>/) || [])[1] || '534'
    const rawImage = decodeHtml(bingImage)
    const image = rawImage ? `${rawImage}&w=${maxW}&h=${maxH}&c=14` : ''

    const descRaw = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                     block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || ''
    const description = decodeHtml(descRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 200)

    if (title && link) items.push({ title, link, pubDate, source, image, description })
  }
  return items
}

// Domains that block scraping — skip OG fetch, use Bing thumbnail directly
const BLOCKED_DOMAINS = ['msn.com', 'aol.com', 'yahoo.com', 'apnews.com', 'wsj.com', 'nytimes.com', 'ft.com']

async function fetchOGImage(articleUrl: string): Promise<string> {
  if (!articleUrl || !articleUrl.startsWith('http')) return ''
  try { if (BLOCKED_DOMAINS.some(d => new URL(articleUrl).hostname.includes(d))) return '' } catch {}
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(articleUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return ''
    const reader = res.body?.getReader()
    if (!reader) return ''
    const decoder = new TextDecoder()
    let html = ''
    while (html.length < 25000) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: !done })
      if (html.includes('og:image') || html.includes('twitter:image')) break
    }
    try { reader.cancel() } catch {}
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
           || html.match(/<meta[^>]+name=["']twitter:image[^"']*["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image/i)
    let img = m?.[1] || ''
    if (img && !img.startsWith('http')) {
      try { img = new URL(img, res.url || articleUrl).href } catch { img = '' }
    }
    return img
  } catch {
    return ''
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  if (!query) return Response.json({ articles: [] })

  const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=RSS`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml, application/xml, text/xml, */*' },
    })
    if (!res.ok) return Response.json({ articles: [], error: `HTTP ${res.status}` })
    const xml = await res.text()
    const articles = parseRSS(xml).slice(0, 10)

    // OG images only — Bing thumbnails are often white-background cutouts
    const enriched = await Promise.all(
      articles.map(async (a) => {
        const ogImage = await fetchOGImage(a.link)
        return { ...a, image: ogImage }
      })
    )

    return Response.json({ articles: enriched })
  } catch (e) {
    return Response.json({ articles: [], error: String(e) })
  }
}
