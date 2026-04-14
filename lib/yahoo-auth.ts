// Yahoo Finance requires a crumb + cookie for API access
// This module handles fetching and caching them server-side

interface AuthCache {
  crumb: string
  cookie: string
  expires: number
}

let cache: AuthCache | null = null

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

export async function getYahooAuth(): Promise<{ crumb: string; cookie: string } | null> {
  // Return cached if still valid (30 min)
  if (cache && Date.now() < cache.expires) {
    return { crumb: cache.crumb, cookie: cache.cookie }
  }

  try {
    // Step 1: Hit Yahoo Finance to get session cookie
    const homeRes = await fetch('https://finance.yahoo.com/', {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    })

    const rawCookies = homeRes.headers.getSetCookie?.() ?? []
    const cookieStr = rawCookies
      .map(c => c.split(';')[0])
      .filter(Boolean)
      .join('; ')

    if (!cookieStr) return null

    // Step 2: Get crumb using the session cookie
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: {
        'User-Agent': UA,
        'Accept': '*/*',
        'Cookie': cookieStr,
        'Referer': 'https://finance.yahoo.com/',
      },
    })

    if (!crumbRes.ok) return null
    const crumb = await crumbRes.text()
    if (!crumb || crumb.includes('<')) return null

    cache = { crumb, cookie: cookieStr, expires: Date.now() + 30 * 60 * 1000 }
    return { crumb, cookie: cookieStr }
  } catch {
    return null
  }
}
