'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, X, ArrowRight, Check, Search, RefreshCw, ExternalLink, Settings, Sparkles, ChevronLeft, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

// ─── Catalog (same as before) ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'finance', label: 'Finance & Markets', icon: '📈', color: '#22c55e',
    topics: [
      { id: 'stock-market', label: 'Stock Market', query: 'stock market investing Wall Street S&P 500' },
      { id: 'crypto', label: 'Cryptocurrency', query: 'cryptocurrency bitcoin ethereum crypto market' },
      { id: 'economy', label: 'Economy', query: 'US economy Federal Reserve inflation GDP interest rates' },
      { id: 'real-estate', label: 'Real Estate', query: 'real estate housing market property prices' },
      { id: 'venture-capital', label: 'Venture Capital', query: 'venture capital startup funding investment rounds' },
      { id: 'earnings', label: 'Earnings Reports', query: 'earnings report quarterly results revenue profit' },
      { id: 'forex', label: 'Forex', query: 'forex currency exchange rates dollar euro pound' },
      { id: 'commodities', label: 'Commodities', query: 'commodities gold oil gas prices futures' },
      { id: 'bonds', label: 'Bonds & Treasury', query: 'treasury bonds yield interest rates debt' },
      { id: 'ipo', label: 'IPOs', query: 'IPO initial public offering stock listing' },
    ],
  },
  { id: 'football', label: 'Football / Soccer', icon: '⚽', color: '#3b82f6',
    topics: [
      { id: 'champions-league', label: 'Champions League', query: 'UEFA Champions League results fixtures' },
      { id: 'europa-league', label: 'Europa League', query: 'UEFA Europa League results fixtures' },
      { id: 'premier-league', label: 'Premier League', query: 'Premier League football table results fixtures' },
      { id: 'la-liga', label: 'La Liga', query: 'La Liga Spain football results table' },
      { id: 'serie-a', label: 'Serie A', query: 'Serie A Italy football results table' },
      { id: 'bundesliga', label: 'Bundesliga', query: 'Bundesliga Germany football results table' },
      { id: 'ligue-1', label: 'Ligue 1', query: 'Ligue 1 France football results table' },
      { id: 'mls', label: 'MLS', query: 'MLS Major League Soccer results' },
      { id: 'world-cup', label: 'World Cup', query: 'FIFA World Cup football international' },
      { id: 'euro', label: 'Euros', query: 'UEFA European Championship football' },
      { id: 'copa-america', label: 'Copa America', query: 'Copa America football South America' },
      { id: 'transfers', label: 'Transfer News', query: 'football transfer news signing rumours' },
    ],
  },
  { id: 'american-sports', label: 'American Sports', icon: '🏈', color: '#f97316',
    topics: [
      { id: 'nfl', label: 'NFL', query: 'NFL American football results standings' },
      { id: 'nba', label: 'NBA', query: 'NBA basketball results standings' },
      { id: 'mlb', label: 'MLB Baseball', query: 'MLB baseball results standings' },
      { id: 'nhl', label: 'NHL Hockey', query: 'NHL ice hockey results standings' },
      { id: 'ncaa-football', label: 'College Football', query: 'NCAA college football results rankings' },
      { id: 'ncaa-basketball', label: 'College Basketball', query: 'NCAA college basketball March Madness' },
      { id: 'ufc', label: 'UFC / MMA', query: 'UFC MMA fight results news' },
      { id: 'boxing', label: 'Boxing', query: 'boxing fight results champion news' },
    ],
  },
  { id: 'motorsport', label: 'Motorsport', icon: '🏎️', color: '#ef4444',
    topics: [
      { id: 'formula-1', label: 'Formula 1', query: 'Formula 1 F1 Grand Prix race results' },
      { id: 'motogp', label: 'MotoGP', query: 'MotoGP motorcycle Grand Prix race results' },
      { id: 'nascar', label: 'NASCAR', query: 'NASCAR Cup Series race results standings' },
      { id: 'indycar', label: 'IndyCar', query: 'IndyCar series race results Indy 500' },
      { id: 'wec', label: 'WEC / Le Mans', query: 'WEC World Endurance Championship Le Mans' },
      { id: 'rally', label: 'WRC Rally', query: 'WRC World Rally Championship results' },
      { id: 'formula-e', label: 'Formula E', query: 'Formula E electric racing results' },
    ],
  },
  { id: 'tennis', label: 'Tennis', icon: '🎾', color: '#a3e635',
    topics: [
      { id: 'grand-slams', label: 'Grand Slams', query: 'tennis Grand Slam Australian Open French Open Wimbledon US Open' },
      { id: 'atp', label: 'ATP Tour', query: 'ATP tennis tour results rankings' },
      { id: 'wta', label: 'WTA Tour', query: 'WTA tennis tour results rankings' },
      { id: 'davis-cup', label: 'Davis Cup', query: 'Davis Cup tennis national teams' },
    ],
  },
  { id: 'golf', label: 'Golf', icon: '⛳', color: '#84cc16',
    topics: [
      { id: 'pga-tour', label: 'PGA Tour', query: 'PGA Tour golf results leaderboard' },
      { id: 'majors', label: 'Majors', query: 'golf major Masters US Open The Open Ryder Cup' },
      { id: 'liv-golf', label: 'LIV Golf', query: 'LIV Golf results standings' },
      { id: 'lpga', label: 'LPGA', query: 'LPGA womens golf results' },
    ],
  },
  { id: 'rugby', label: 'Rugby', icon: '🏉', color: '#8b5cf6',
    topics: [
      { id: 'six-nations', label: 'Six Nations', query: 'Six Nations rugby results table' },
      { id: 'premiership-rugby', label: 'Premiership Rugby', query: 'Premiership Rugby results standings' },
      { id: 'super-rugby', label: 'Super Rugby', query: 'Super Rugby results standings' },
      { id: 'nrl', label: 'NRL', query: 'NRL rugby league results standings' },
    ],
  },
  { id: 'cricket', label: 'Cricket', icon: '🏏', color: '#06b6d4',
    topics: [
      { id: 'test-cricket', label: 'Test Cricket', query: 'Test cricket results series' },
      { id: 'ipl', label: 'IPL', query: 'IPL Indian Premier League results' },
      { id: 'ashes', label: 'The Ashes', query: 'The Ashes England Australia cricket' },
      { id: 't20-world-cup', label: 'T20 World Cup', query: 'T20 World Cup cricket results' },
    ],
  },
  { id: 'esports', label: 'Esports & Gaming', icon: '🎮', color: '#a855f7',
    topics: [
      { id: 'esports', label: 'Esports', query: 'esports tournament results championship' },
      { id: 'league-of-legends', label: 'League of Legends', query: 'League of Legends LCS LEC Worlds esports' },
      { id: 'valorant', label: 'Valorant', query: 'Valorant Champions Tour VCT esports' },
      { id: 'cs2', label: 'CS2', query: 'CS2 Counter-Strike major tournament results' },
      { id: 'gaming-news', label: 'Gaming News', query: 'video game release news PlayStation Xbox Nintendo' },
    ],
  },
  { id: 'tech', label: 'Technology', icon: '💻', color: '#38bdf8',
    topics: [
      { id: 'ai', label: 'AI', query: 'artificial intelligence AI ChatGPT machine learning' },
      { id: 'big-tech', label: 'Big Tech', query: 'Apple Google Microsoft Meta Amazon tech earnings' },
      { id: 'startups', label: 'Startups', query: 'startup funding venture capital tech unicorn' },
      { id: 'cybersecurity', label: 'Cybersecurity', query: 'cybersecurity hacking data breach privacy' },
      { id: 'smartphones', label: 'Smartphones', query: 'iPhone Android smartphone release review' },
      { id: 'space-tech', label: 'Space & SpaceX', query: 'SpaceX NASA space launch rocket satellite' },
      { id: 'ev', label: 'Electric Vehicles', query: 'electric vehicle EV Tesla Rivian charging' },
      { id: 'social-media', label: 'Social Media', query: 'social media TikTok Instagram X Twitter news' },
    ],
  },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#fb923c',
    topics: [
      { id: 'movies', label: 'Movies', query: 'movies film box office Hollywood release' },
      { id: 'tv-shows', label: 'TV & Streaming', query: 'TV shows Netflix HBO streaming series' },
      { id: 'music', label: 'Music', query: 'music album release chart news artist' },
      { id: 'celebrity', label: 'Celebrity News', query: 'celebrity entertainment gossip news' },
      { id: 'awards', label: 'Awards Shows', query: 'Oscars Grammys Emmys awards ceremony' },
      { id: 'anime', label: 'Anime & Manga', query: 'anime manga release news series season' },
    ],
  },
  { id: 'health', label: 'Health & Fitness', icon: '💪', color: '#4ade80',
    topics: [
      { id: 'health-news', label: 'Health News', query: 'health medical research study news' },
      { id: 'nutrition', label: 'Nutrition & Diet', query: 'nutrition diet health food science' },
      { id: 'mental-health', label: 'Mental Health', query: 'mental health wellness anxiety depression research' },
      { id: 'fitness', label: 'Fitness & Exercise', query: 'fitness exercise workout training health' },
      { id: 'medicine', label: 'Medicine', query: 'medicine drug FDA approval clinical trial' },
    ],
  },
  { id: 'science', label: 'Science & Nature', icon: '🔬', color: '#34d399',
    topics: [
      { id: 'science', label: 'Science', query: 'science discovery research breakthrough' },
      { id: 'space', label: 'Space & Astronomy', query: 'space NASA astronomy planet discovery' },
      { id: 'climate', label: 'Climate & Environment', query: 'climate change environment renewable energy' },
      { id: 'biology', label: 'Biology & Nature', query: 'biology nature wildlife species discovery' },
      { id: 'physics', label: 'Physics', query: 'physics quantum particle CERN discovery' },
    ],
  },
  { id: 'world-news', label: 'World & Politics', icon: '🌍', color: '#94a3b8',
    topics: [
      { id: 'us-politics', label: 'US Politics', query: 'US politics White House Congress Senate news' },
      { id: 'world-news', label: 'World News', query: 'world news international breaking news' },
      { id: 'uk-news', label: 'UK News', query: 'UK news Britain politics Parliament' },
      { id: 'europe', label: 'Europe', query: 'Europe EU news politics economy' },
      { id: 'middle-east', label: 'Middle East', query: 'Middle East news geopolitics' },
      { id: 'asia', label: 'Asia', query: 'Asia China Japan South Korea news' },
      { id: 'business-news', label: 'Business News', query: 'business corporate mergers acquisitions news' },
    ],
  },
  { id: 'lifestyle', label: 'Lifestyle', icon: '✨', color: '#f472b6',
    topics: [
      { id: 'fashion', label: 'Fashion', query: 'fashion style luxury brand designer news' },
      { id: 'food', label: 'Food & Restaurants', query: 'food restaurant chef culinary news' },
      { id: 'travel', label: 'Travel', query: 'travel destination airline hotel tourism news' },
      { id: 'cars', label: 'Cars & Supercars', query: 'supercar luxury car review release new model' },
      { id: 'watches', label: 'Watches & Luxury', query: 'luxury watch Rolex Patek Philippe auction' },
      { id: 'sneakers', label: 'Sneakers', query: 'sneaker release Jordan Nike Adidas drop' },
    ],
  },
]

const TEAM_SUGGESTIONS: Record<string, { id: string; label: string; query: string }[]> = {
  football: [
    { id: 'team-chelsea', label: 'Chelsea FC', query: 'Chelsea FC football results fixtures news' },
    { id: 'team-westham', label: 'West Ham', query: 'West Ham United football results news' },
    { id: 'team-real-madrid', label: 'Real Madrid', query: 'Real Madrid football results news' },
    { id: 'team-barcelona', label: 'Barcelona', query: 'FC Barcelona football results news' },
    { id: 'team-man-city', label: 'Man City', query: 'Manchester City football results news' },
    { id: 'team-arsenal', label: 'Arsenal', query: 'Arsenal FC football results news' },
    { id: 'team-liverpool', label: 'Liverpool', query: 'Liverpool FC football results news' },
    { id: 'team-man-utd', label: 'Man United', query: 'Manchester United football results news' },
    { id: 'team-spurs', label: 'Tottenham', query: 'Tottenham Hotspur football results news' },
    { id: 'team-atletico', label: 'Atletico Madrid', query: 'Atletico Madrid football results news' },
    { id: 'team-juventus', label: 'Juventus', query: 'Juventus football results news' },
    { id: 'team-inter', label: 'Inter Milan', query: 'Inter Milan football results news' },
    { id: 'team-milan', label: 'AC Milan', query: 'AC Milan football results news' },
    { id: 'team-psg', label: 'PSG', query: 'Paris Saint-Germain PSG football results news' },
    { id: 'team-bayern', label: 'Bayern Munich', query: 'Bayern Munich football results news' },
    { id: 'team-dortmund', label: 'Dortmund', query: 'Borussia Dortmund football results news' },
    { id: 'team-napoli', label: 'Napoli', query: 'Napoli football results news' },
    { id: 'team-ajax', label: 'Ajax', query: 'Ajax Amsterdam football results news' },
  ],
  motorsport: [
    { id: 'team-ferrari-f1', label: 'Ferrari', query: 'Ferrari Formula 1 F1 team race results' },
    { id: 'team-redbull-f1', label: 'Red Bull Racing', query: 'Red Bull Racing Formula 1 results news' },
    { id: 'team-mercedes-f1', label: 'Mercedes F1', query: 'Mercedes AMG Formula 1 results news' },
    { id: 'team-mclaren-f1', label: 'McLaren F1', query: 'McLaren Formula 1 results news' },
    { id: 'team-alpine-f1', label: 'Alpine F1', query: 'Alpine Formula 1 results news' },
    { id: 'team-aston-f1', label: 'Aston Martin F1', query: 'Aston Martin Formula 1 results news' },
    { id: 'driver-verstappen', label: 'Verstappen', query: 'Max Verstappen Formula 1 news' },
    { id: 'driver-hamilton', label: 'Hamilton', query: 'Lewis Hamilton Formula 1 Ferrari news' },
    { id: 'driver-leclerc', label: 'Leclerc', query: 'Charles Leclerc Ferrari Formula 1 news' },
    { id: 'driver-norris', label: 'Lando Norris', query: 'Lando Norris McLaren Formula 1 news' },
  ],
  tennis: [
    { id: 'player-sinner', label: 'Sinner', query: 'Jannik Sinner tennis results news' },
    { id: 'player-alcaraz', label: 'Alcaraz', query: 'Carlos Alcaraz tennis results news' },
    { id: 'player-djokovic', label: 'Djokovic', query: 'Novak Djokovic tennis results news' },
    { id: 'player-swiatek', label: 'Swiatek', query: 'Iga Swiatek tennis results news' },
    { id: 'player-sabalenka', label: 'Sabalenka', query: 'Aryna Sabalenka tennis results news' },
  ],
  'american-sports': [
    { id: 'team-lakers', label: 'LA Lakers', query: 'Los Angeles Lakers NBA results news' },
    { id: 'team-warriors', label: 'Warriors', query: 'Golden State Warriors NBA results news' },
    { id: 'team-celtics', label: 'Celtics', query: 'Boston Celtics NBA results news' },
    { id: 'team-cowboys', label: 'Cowboys', query: 'Dallas Cowboys NFL results news' },
    { id: 'team-chiefs', label: 'Chiefs', query: 'Kansas City Chiefs NFL results news' },
    { id: 'team-patriots', label: 'Patriots', query: 'New England Patriots NFL results news' },
    { id: 'team-yankees', label: 'Yankees', query: 'New York Yankees MLB results news' },
  ],
  golf: [
    { id: 'golfer-mcilroy', label: 'Rory McIlroy', query: 'Rory McIlroy golf results news' },
    { id: 'golfer-scheffler', label: 'Scheffler', query: 'Scottie Scheffler golf results news' },
    { id: 'golfer-woods', label: 'Tiger Woods', query: 'Tiger Woods golf news comeback' },
  ],
}

interface Preference {
  id: string; label: string; query: string; icon: string; color: string; type: 'topic' | 'team' | 'custom'
}
interface Article {
  title: string; link: string; pubDate: string; source: string; image: string; description: string
}
interface FeedState {
  articles: Article[]; loading: boolean
}

function timeAgo(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Card sizes for bento grid
const SIZE_PATTERN = ['large', 'medium', 'small', 'large', 'small', 'medium', 'large', 'small', 'small', 'medium', 'large', 'medium'] as const
type CardSize = 'large' | 'medium' | 'small'

// ─── Bento Card ───────────────────────────────────────────────────────────────
function BentoCard({ pref, feed, size, onClick, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDragOver }: {
  pref: Preference; feed?: FeedState; size: CardSize; onClick: () => void
  onDragStart?: () => void; onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void; onDragEnd?: () => void
  isDragging?: boolean; isDragOver?: boolean
}) {
  const loading = feed?.loading ?? true
  const articles = feed?.articles ?? []
  const coverImage = articles.find(a => a.image)?.image
  const topArticle = articles[0]

  const colClass: Record<CardSize, string> = {
    large: 'col-span-2',
    medium: 'col-span-2',
    small: 'col-span-1',
  }

  // Fixed image height per size (inline styles — Tailwind can't detect dynamic classes)
  const imgHeightPx: Record<CardSize, number> = {
    large: 288,
    medium: 224,
    small: 208,
  }

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`${colClass[size]} rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl select-none bg-[#111]`}
      style={{
        boxShadow: isDragOver ? `0 0 0 2px ${pref.color}` : `0 0 0 1px ${pref.color}22`,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {/* Image — fixed height, always fills */}
      <div className="relative overflow-hidden" style={{ height: imgHeightPx[size] }}>
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              const parent = el.parentElement
              if (parent) parent.style.background = `linear-gradient(135deg, ${pref.color}30 0%, #080808 100%)`
            }}
          />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${pref.color}30 0%, #080808 100%)` }}>
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl opacity-20">{pref.icon}</span>
            </div>
          </div>
        )}
        {/* Bottom gradient for smooth transition to card body */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111] to-transparent" />
        {/* Colored top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: pref.color }} />
        {/* Top-right badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {!loading && articles.length > 0 && (
            <span className="text-[10px] text-white/60 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full">{articles.length}</span>
          )}
          <GripVertical size={11} className="text-white/30 group-hover:text-white/60 transition-colors" />
        </div>
      </div>

      {/* Text content below image */}
      <div className="px-3 pt-2 pb-3">
        <span
          className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full mb-1.5 inline-block"
          style={{ color: pref.color, background: `${pref.color}20` }}
        >
          {pref.label}
        </span>

        {loading ? (
          <div className="space-y-1 mt-1">
            <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-2/3" />
          </div>
        ) : topArticle ? (
          <>
            {size !== 'small' && topArticle.source && (
              <p className="text-[10px] truncate mb-0.5" style={{ color: pref.color }}>{topArticle.source}</p>
            )}
            <p className={`font-semibold text-white/90 leading-snug line-clamp-2 ${size === 'large' ? 'text-sm' : 'text-xs'}`}>
              {topArticle.title}
            </p>
            <p className="text-white/35 text-[10px] mt-1">{timeAgo(topArticle.pubDate)}</p>
          </>
        ) : (
          <p className="text-white/30 text-xs mt-1">No articles found</p>
        )}
      </div>
    </div>
  )
}

// ─── Article Drawer ───────────────────────────────────────────────────────────
function ArticleDrawer({ pref, feed, onClose, onRefresh }: {
  pref: Preference; feed?: FeedState; onClose: () => void; onRefresh: () => void
}) {
  const articles = feed?.articles ?? []
  const loading = feed?.loading ?? false
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null)
  const [articleSummaries, setArticleSummaries] = useState<Record<number, string>>({})
  const [articleSummaryLoading, setArticleSummaryLoading] = useState<number | null>(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (selectedArticle !== null) setSelectedArticle(null); else onClose() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, selectedArticle])

  useEffect(() => {
    if (!loading && articles.length > 0 && !summary && !hasFetched.current) {
      hasFetched.current = true
      fetchSectionSummary()
    }
  }, [loading, articles.length]) // eslint-disable-line

  async function fetchSectionSummary() {
    setSummaryLoading(true)
    try {
      const res = await fetch('/api/news-summary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ articles, topic: pref.label, mode: 'section' }),
      })
      const data = await res.json()
      setSummary(data.summary || null)
    } catch {}
    setSummaryLoading(false)
  }

  async function fetchArticleSummary(index: number) {
    if (articleSummaries[index]) return
    setArticleSummaryLoading(index)
    try {
      const res = await fetch('/api/news-summary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ articles: [articles[index]], topic: pref.label, mode: 'article' }),
      })
      const data = await res.json()
      if (data.summary) setArticleSummaries(prev => ({ ...prev, [index]: data.summary }))
    } catch {}
    setArticleSummaryLoading(null)
  }

  function openArticle(index: number) {
    setSelectedArticle(index)
    fetchArticleSummary(index)
  }

  const coverImage = articles.find(a => a.image)?.image

  // ── Article detail view ──
  if (selectedArticle !== null) {
    const a = articles[selectedArticle]
    return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full md:max-w-xl md:mx-4 bg-[#0e0e0e] border border-white/10 rounded-t-3xl md:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: pref.color }} />

          {/* Article image */}
          <div className="relative shrink-0 overflow-hidden" style={{ height: '220px', background: `linear-gradient(135deg, ${pref.color}20, #0e0e0e)` }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-4xl opacity-10">{pref.icon}</span>
            </div>
            {a.image && (
              <img src={a.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />

            <button onClick={() => setSelectedArticle(null)} className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/70 hover:text-white transition-colors border border-white/10 text-xs">
              <ChevronLeft size={12} /> Back
            </button>
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10">
              <X size={14} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-5">
            <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mb-3 inline-block" style={{ color: pref.color, background: `${pref.color}20` }}>
              {a.source || pref.label}
            </span>
            <h2 className="text-white text-lg font-bold leading-snug mb-1">{a.title}</h2>
            {a.pubDate && <p className="text-white/40 text-xs mb-4">{timeAgo(a.pubDate)}</p>}

            {/* AI Summary */}
            <div className="mb-4 p-4 rounded-2xl" style={{ background: `${pref.color}10`, border: `1px solid ${pref.color}20` }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} style={{ color: pref.color }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: pref.color }}>AI Summary</span>
                {articleSummaryLoading === selectedArticle && <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin ml-1" />}
              </div>
              {articleSummaryLoading === selectedArticle && !articleSummaries[selectedArticle] ? (
                <div className="space-y-1.5">
                  <div className="h-3 bg-white/8 rounded animate-pulse w-full" />
                  <div className="h-3 bg-white/8 rounded animate-pulse w-5/6" />
                  <div className="h-3 bg-white/8 rounded animate-pulse w-4/6" />
                </div>
              ) : articleSummaries[selectedArticle] ? (
                <p className="text-white/80 text-sm leading-relaxed">{articleSummaries[selectedArticle]}</p>
              ) : (
                <p className="text-white/30 text-xs">Add ANTHROPIC_API_KEY to enable summaries</p>
              )}
            </div>

            {a.description && <p className="text-white/50 text-sm leading-relaxed mb-4">{a.description}</p>}

            <a href={a.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: pref.color, color: '#0a0a0a' }}>
              <ExternalLink size={14} /> Read Full Article
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Tile grid view ──
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full md:max-w-2xl md:mx-4 bg-[#0e0e0e] border border-white/10 rounded-t-3xl md:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Hero header */}
        <div className="relative h-44 shrink-0 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${pref.color}30, #0e0e0e)` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/40 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: pref.color }} />

          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10">
            <X size={14} />
          </button>

          <div className="absolute bottom-4 left-5 right-14">
            <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mb-2 inline-block" style={{ color: pref.color, background: `${pref.color}25` }}>
              {pref.label}
            </span>
            <p className="text-white/50 text-xs">{articles.length} articles</p>
          </div>
        </div>

        {/* AI Section Digest */}
        <div className="px-5 py-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} style={{ color: pref.color }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: pref.color }}>AI Digest</span>
            {summaryLoading && <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin ml-1" />}
            {summary && (
              <button onClick={fetchSectionSummary} className="ml-auto text-white/30 hover:text-white/60 transition-colors">
                <RefreshCw size={11} />
              </button>
            )}
          </div>
          {summaryLoading && !summary ? (
            <div className="space-y-1.5">
              <div className="h-3 bg-white/8 rounded animate-pulse w-full" />
              <div className="h-3 bg-white/8 rounded animate-pulse w-5/6" />
              <div className="h-3 bg-white/8 rounded animate-pulse w-4/6" />
            </div>
          ) : summary ? (
            <p className="text-white/70 text-sm leading-relaxed">{summary}</p>
          ) : !summaryLoading ? (
            <p className="text-white/30 text-xs">Add an Anthropic API key to .env.local to enable AI summaries</p>
          ) : null}
        </div>

        {/* Article tile grid */}
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white/5 animate-pulse">
                  <div className="h-32 bg-white/8" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-white/8 rounded w-full" />
                    <div className="h-3 bg-white/8 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {articles.map((a, i) => (
                <button
                  key={i}
                  onClick={() => openArticle(i)}
                  className="rounded-2xl overflow-hidden bg-white/5 hover:bg-white/8 transition-all text-left border border-white/8 hover:border-white/15 hover:scale-[1.02] duration-200"
                >
                  {/* Article image */}
                  <div className="relative h-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${pref.color}20, #111)` }}>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-2xl opacity-20">{pref.icon}</span>
                    </div>
                    {a.image && (
                      <img src={a.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {a.source && (
                      <span className="absolute bottom-2 left-2 text-[10px] text-white/60 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full truncate max-w-[80%]">{a.source}</span>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-white text-xs font-medium leading-snug line-clamp-3">{a.title}</p>
                    {a.pubDate && <p className="text-white/35 text-[10px] mt-2">{timeAgo(a.pubDate)}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Setup Wizard ─────────────────────────────────────────────────────────────
function SetupWizard({ onDone }: { onDone: (prefs: Preference[]) => void }) {
  const [step, setStep] = useState<'categories' | 'topics' | 'teams' | 'custom'>('categories')
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set())
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
  const [customLabel, setCustomLabel] = useState('')
  const [customQuery, setCustomQuery] = useState('')
  const [customs, setCustoms] = useState<{ label: string; query: string }[]>([])
  const [catSearch, setCatSearch] = useState('')

  const toggleCat = (id: string) => setSelectedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleTopic = (id: string) => setSelectedTopics(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleTeam = (id: string) => setSelectedTeams(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const activeCats = CATEGORIES.filter(c => selectedCats.has(c.id))
  const relevantTeamCats = Object.keys(TEAM_SUGGESTIONS).filter(id => selectedCats.has(id))
  const filteredCats = catSearch ? CATEGORIES.filter(c => c.label.toLowerCase().includes(catSearch.toLowerCase())) : CATEGORIES

  function finish() {
    const prefs: Preference[] = []
    for (const cat of CATEGORIES)
      for (const t of cat.topics)
        if (selectedTopics.has(t.id))
          prefs.push({ id: t.id, label: t.label, query: t.query, icon: cat.icon, color: cat.color, type: 'topic' })
    for (const [catId, teams] of Object.entries(TEAM_SUGGESTIONS)) {
      const cat = CATEGORIES.find(c => c.id === catId)
      for (const t of teams)
        if (selectedTeams.has(t.id))
          prefs.push({ id: t.id, label: t.label, query: t.query, icon: cat?.icon || '🏟️', color: cat?.color || '#C9A96E', type: 'team' })
    }
    customs.forEach((c, i) => prefs.push({ id: `custom-${Date.now()}-${i}`, label: c.label, query: c.query, icon: '◈', color: '#C9A96E', type: 'custom' }))
    onDone(prefs)
  }

  const steps = ['categories', 'topics', 'teams', 'custom'] as const
  const stepLabels = ['Interests', 'Topics', 'Teams', 'Custom']

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${step === s ? 'bg-gold text-bg ring-2 ring-gold/30' : steps.indexOf(step) > i ? 'bg-gold/30 text-gold' : 'bg-surface2 text-muted'}`}>
              {steps.indexOf(step) > i ? <Check size={12} /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`h-px flex-1 mx-2 ${steps.indexOf(step) > i ? 'bg-gold/40' : 'bg-surface2'}`} />}
          </div>
        ))}
      </div>
      <div className="flex mb-8">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-xs tracking-widest uppercase ${step === s ? 'text-gold' : 'text-muted'}`}>{stepLabels[i]}</div>
        ))}
      </div>

      {step === 'categories' && (
        <div>
          <h2 className="text-cream text-xl font-bold tracking-wide mb-1">What are you into?</h2>
          <p className="text-muted text-sm mb-4">Pick everything you want news on.</p>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input value={catSearch} onChange={e => setCatSearch(e.target.value)}
              placeholder="Search categories..." className="input-base w-full text-sm" style={{ paddingLeft: '2.25rem' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
            {filteredCats.map(cat => (
              <button key={cat.id} onClick={() => toggleCat(cat.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${selectedCats.has(cat.id) ? 'border-gold bg-gold-dim text-cream' : 'border-gold-border bg-surface2 text-muted hover:border-gold/40 hover:text-cream'}`}>
                <span className="text-lg shrink-0">{cat.icon}</span>
                <span className="text-xs font-medium leading-tight">{cat.label}</span>
                {selectedCats.has(cat.id) && <Check size={11} className="ml-auto shrink-0 text-gold" />}
              </button>
            ))}
          </div>
          {selectedCats.size > 0 && <p className="text-muted text-xs mt-3">{selectedCats.size} selected</p>}
          <button onClick={() => setStep('topics')} disabled={selectedCats.size === 0}
            className="btn-gold mt-5 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            Next <ArrowRight size={14} />
          </button>
        </div>
      )}

      {step === 'topics' && (
        <div>
          <h2 className="text-cream text-xl font-bold mb-1">Which topics?</h2>
          <p className="text-muted text-sm mb-5">Pick exactly what you want to follow.</p>
          <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
            {activeCats.map(cat => (
              <div key={cat.id}>
                <p className="label-sm mb-2">{cat.icon} {cat.label}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.topics.map(t => (
                    <button key={t.id} onClick={() => toggleTopic(t.id)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${selectedTopics.has(t.id) ? 'border-gold bg-gold-dim text-gold' : 'border-gold-border text-muted hover:border-gold/40 hover:text-cream'}`}>
                      {selectedTopics.has(t.id) && '✓ '}{t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep('categories')} className="px-4 py-2 text-muted text-sm hover:text-cream">← Back</button>
            <button onClick={() => setStep(relevantTeamCats.length > 0 ? 'teams' : 'custom')} className="btn-gold flex items-center gap-2">Next <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {step === 'teams' && (
        <div>
          <h2 className="text-cream text-xl font-bold mb-1">Specific teams or players?</h2>
          <p className="text-muted text-sm mb-5">Get dedicated feeds for individual teams and athletes.</p>
          <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
            {relevantTeamCats.map(catId => {
              const teams = TEAM_SUGGESTIONS[catId]
              const cat = CATEGORIES.find(c => c.id === catId)
              return (
                <div key={catId}>
                  <p className="label-sm mb-2">{cat?.icon} {cat?.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {teams.map(t => (
                      <button key={t.id} onClick={() => toggleTeam(t.id)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${selectedTeams.has(t.id) ? 'border-gold bg-gold-dim text-gold' : 'border-gold-border text-muted hover:border-gold/40 hover:text-cream'}`}>
                        {selectedTeams.has(t.id) && '✓ '}{t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep('topics')} className="px-4 py-2 text-muted text-sm hover:text-cream">← Back</button>
            <button onClick={() => setStep('custom')} className="btn-gold flex items-center gap-2">Next <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {step === 'custom' && (
        <div>
          <h2 className="text-cream text-xl font-bold mb-1">Anything else?</h2>
          <p className="text-muted text-sm mb-5">Add any topic not in the list.</p>
          <div className="flex gap-2 mb-3">
            <input value={customLabel} onChange={e => setCustomLabel(e.target.value)} placeholder="Name" className="input-base flex-1 text-sm" />
            <input value={customQuery} onChange={e => setCustomQuery(e.target.value)} placeholder="Search term" className="input-base flex-1 text-sm" onKeyDown={e => e.key === 'Enter' && customLabel && customQuery && (setCustoms(p => [...p, { label: customLabel.trim(), query: customQuery.trim() }]), setCustomLabel(''), setCustomQuery(''))} />
            <button onClick={() => { if (customLabel && customQuery) { setCustoms(p => [...p, { label: customLabel.trim(), query: customQuery.trim() }]); setCustomLabel(''); setCustomQuery('') } }} className="btn-gold px-3"><Plus size={14} /></button>
          </div>
          {customs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {customs.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-surface2 border border-gold-border rounded-full px-3 py-1">
                  <span className="text-cream text-xs">{c.label}</span>
                  <button onClick={() => setCustoms(p => p.filter((_, j) => j !== i))} className="text-muted hover:text-negative ml-1"><X size={11} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep(relevantTeamCats.length > 0 ? 'teams' : 'topics')} className="px-4 py-2 text-muted text-sm hover:text-cream">← Back</button>
            <button onClick={finish} className="btn-gold flex items-center gap-2"><Check size={14} /> Finish Setup</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState<Preference[]>([])
  const [feeds, setFeeds] = useState<Record<string, FeedState>>({})
  const [setupDone, setSetupDone] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeDrawer, setActiveDrawer] = useState<Preference | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  async function savePrefs(newPrefs: Preference[]) {
    localStorage.setItem('news-preferences-v3', JSON.stringify(newPrefs))
    if (user) {
      try {
        await supabase.auth.updateUser({ data: { news_preferences: newPrefs } })
      } catch {}
    }
  }

  // Load prefs: Supabase user metadata first, fall back to localStorage
  useEffect(() => {
    async function load() {
      if (user) {
        const { data } = await supabase.auth.getUser()
        const cloudPrefs = data?.user?.user_metadata?.news_preferences
        if (cloudPrefs?.length) {
          setPrefs(cloudPrefs)
          setSetupDone(true)
          setLoaded(true)
          return
        }
      }
      // Fall back to localStorage
      const saved = localStorage.getItem('news-preferences-v3')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPrefs(parsed)
          setSetupDone(true)
          // If logged in, sync local prefs to cloud
          if (user && parsed.length) {
            supabase.auth.updateUser({ data: { news_preferences: parsed } }).catch(() => {})
          }
        } catch {}
      }
      setLoaded(true)
    }
    load()
  }, [user]) // eslint-disable-line

  const fetchFeed = useCallback(async (pref: Preference) => {
    setFeeds(prev => ({ ...prev, [pref.id]: { loading: true, articles: prev[pref.id]?.articles ?? [] } }))
    try {
      const res = await fetch(`/api/news-feed?q=${encodeURIComponent(pref.query)}`)
      const data = await res.json()
      setFeeds(prev => ({ ...prev, [pref.id]: { articles: data.articles || [], loading: false } }))
    } catch {
      setFeeds(prev => ({ ...prev, [pref.id]: { articles: [], loading: false } }))
    }
  }, [])

  async function handleSetupDone(newPrefs: Preference[]) {
    setPrefs(newPrefs)
    await savePrefs(newPrefs)
    setSetupDone(true)
    setShowSettings(false)
    newPrefs.forEach(p => fetchFeed(p))
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null); setDragOverIndex(null); return
    }
    const newPrefs = [...prefs]
    const [removed] = newPrefs.splice(dragIndex, 1)
    newPrefs.splice(dropIndex, 0, removed)
    setPrefs(newPrefs)
    savePrefs(newPrefs)
    setDragIndex(null); setDragOverIndex(null)
  }

  function handleDragEnd() {
    setDragIndex(null); setDragOverIndex(null)
  }

  useEffect(() => {
    if (setupDone && prefs.length > 0) prefs.forEach(p => fetchFeed(p))
  }, [setupDone]) // eslint-disable-line

  if (!loaded) return null

  if (!setupDone || showSettings) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          {showSettings && <button onClick={() => setShowSettings(false)} className="text-muted hover:text-cream text-sm">← Back</button>}
          <div>
            <p className="label-sm mb-1">{showSettings ? 'Edit' : 'Setup'}</p>
            <h1 className="text-cream text-2xl font-bold tracking-widest uppercase">News Feed</h1>
          </div>
        </div>
        <SetupWizard onDone={handleSetupDone} />
      </div>
    )
  }

  const topics = prefs.filter(p => p.type !== 'team')
  const teams = prefs.filter(p => p.type === 'team')

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="label-sm mb-1">Live Feed</p>
          <h1 className="text-cream text-2xl font-bold tracking-widest uppercase">News</h1>
          <p className="text-muted text-xs mt-0.5">{prefs.length} feeds · tap any card for articles + AI digest</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="btn-gold flex items-center gap-2 text-sm">
          <Settings size={13} /> Edit
        </button>
      </div>

      {/* Bento grid */}
      {topics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {topics.map((pref, i) => (
            <BentoCard key={pref.id} pref={pref} feed={feeds[pref.id]}
              size={SIZE_PATTERN[i % SIZE_PATTERN.length]}
              onClick={() => dragIndex === null ? setActiveDrawer(pref) : undefined}
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              isDragging={dragIndex === i}
              isDragOver={dragOverIndex === i && dragIndex !== i} />
          ))}
        </div>
      )}

      {teams.length > 0 && (
        <>
          <p className="label-sm mb-3 mt-2">Teams & Players</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {teams.map((pref, i) => {
              const globalIndex = topics.length + i
              return (
                <BentoCard key={pref.id} pref={pref} feed={feeds[pref.id]}
                  size="small"
                  onClick={() => dragIndex === null ? setActiveDrawer(pref) : undefined}
                  onDragStart={() => handleDragStart(globalIndex)}
                  onDragOver={e => handleDragOver(e, globalIndex)}
                  onDrop={e => handleDrop(e, globalIndex)}
                  onDragEnd={handleDragEnd}
                  isDragging={dragIndex === globalIndex}
                  isDragOver={dragOverIndex === globalIndex && dragIndex !== globalIndex} />
              )
            })}
          </div>
        </>
      )}

      {activeDrawer && (
        <ArticleDrawer pref={activeDrawer} feed={feeds[activeDrawer.id]}
          onClose={() => setActiveDrawer(null)}
          onRefresh={() => fetchFeed(activeDrawer)} />
      )}
    </div>
  )
}
