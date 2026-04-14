'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, X, RefreshCw, ChevronDown, ChevronUp, Settings, ArrowRight, Check } from 'lucide-react'

// ─── Preset catalog ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'finance',
    label: 'Finance & Markets',
    icon: '📈',
    topics: [
      { id: 'stock-market', label: 'Stock Market', query: 'stock market investing Wall Street' },
      { id: 'crypto', label: 'Crypto', query: 'cryptocurrency bitcoin ethereum crypto market' },
      { id: 'economy', label: 'Economy', query: 'US economy Federal Reserve inflation GDP' },
      { id: 'real-estate', label: 'Real Estate', query: 'real estate housing market property' },
    ],
  },
  {
    id: 'football',
    label: 'Football / Soccer',
    icon: '⚽',
    topics: [
      { id: 'champions-league', label: 'Champions League', query: 'UEFA Champions League' },
      { id: 'premier-league', label: 'Premier League', query: 'Premier League football table results' },
      { id: 'la-liga', label: 'La Liga', query: 'La Liga Spain football' },
      { id: 'serie-a', label: 'Serie A', query: 'Serie A Italy football' },
      { id: 'bundesliga', label: 'Bundesliga', query: 'Bundesliga Germany football' },
      { id: 'mls', label: 'MLS', query: 'MLS Major League Soccer' },
      { id: 'world-cup', label: 'World Cup', query: 'FIFA World Cup football' },
    ],
  },
  {
    id: 'motorsport',
    label: 'Motorsport',
    icon: '🏎️',
    topics: [
      { id: 'formula-1', label: 'Formula 1', query: 'Formula 1 F1 Grand Prix race' },
      { id: 'motogp', label: 'MotoGP', query: 'MotoGP motorcycle race' },
      { id: 'nascar', label: 'NASCAR', query: 'NASCAR race results' },
      { id: 'indycar', label: 'IndyCar', query: 'IndyCar racing' },
    ],
  },
  {
    id: 'tennis',
    label: 'Tennis',
    icon: '🎾',
    topics: [
      { id: 'tennis-grand-slam', label: 'Grand Slams', query: 'tennis Grand Slam Australian Open French Open Wimbledon US Open' },
      { id: 'atp', label: 'ATP Tour', query: 'ATP tennis tour results' },
      { id: 'wta', label: 'WTA Tour', query: 'WTA tennis tour results' },
    ],
  },
  {
    id: 'american-sports',
    label: 'American Sports',
    icon: '🏈',
    topics: [
      { id: 'nfl', label: 'NFL', query: 'NFL football American football' },
      { id: 'nba', label: 'NBA', query: 'NBA basketball' },
      { id: 'mlb', label: 'MLB', query: 'MLB baseball' },
      { id: 'nhl', label: 'NHL', query: 'NHL hockey' },
    ],
  },
  {
    id: 'tech',
    label: 'Technology',
    icon: '💻',
    topics: [
      { id: 'ai', label: 'AI & Machine Learning', query: 'artificial intelligence AI technology' },
      { id: 'big-tech', label: 'Big Tech', query: 'Apple Google Microsoft Meta Amazon tech' },
      { id: 'startups', label: 'Startups', query: 'startup funding venture capital Silicon Valley' },
      { id: 'cybersecurity', label: 'Cybersecurity', query: 'cybersecurity hacking data breach' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    icon: '🌍',
    topics: [
      { id: 'world-news', label: 'World News', query: 'world news breaking news international' },
      { id: 'politics', label: 'US Politics', query: 'US politics White House Congress' },
      { id: 'science', label: 'Science', query: 'science research discovery space NASA' },
      { id: 'entertainment', label: 'Entertainment', query: 'movies music entertainment celebrity' },
    ],
  },
]

// Well-known teams/drivers to suggest
const TEAM_SUGGESTIONS: Record<string, { id: string; label: string; query: string }[]> = {
  football: [
    { id: 'team-chelsea', label: 'Chelsea FC', query: 'Chelsea FC football results news' },
    { id: 'team-westham', label: 'West Ham', query: 'West Ham United football results news' },
    { id: 'team-real-madrid', label: 'Real Madrid', query: 'Real Madrid football results news' },
    { id: 'team-barcelona', label: 'Barcelona', query: 'FC Barcelona football results news' },
    { id: 'team-man-city', label: 'Man City', query: 'Manchester City football results news' },
    { id: 'team-arsenal', label: 'Arsenal', query: 'Arsenal FC football results news' },
    { id: 'team-liverpool', label: 'Liverpool', query: 'Liverpool FC football results news' },
    { id: 'team-spurs', label: 'Tottenham', query: 'Tottenham Hotspur football results news' },
    { id: 'team-atletico', label: 'Atletico Madrid', query: 'Atletico Madrid football results news' },
    { id: 'team-juventus', label: 'Juventus', query: 'Juventus football results news' },
    { id: 'team-inter', label: 'Inter Milan', query: 'Inter Milan football results news' },
    { id: 'team-milan', label: 'AC Milan', query: 'AC Milan football results news' },
    { id: 'team-psg', label: 'PSG', query: 'Paris Saint-Germain football results news' },
    { id: 'team-bayern', label: 'Bayern Munich', query: 'Bayern Munich football results news' },
    { id: 'team-dortmund', label: 'Dortmund', query: 'Borussia Dortmund football results news' },
  ],
  motorsport: [
    { id: 'team-ferrari-f1', label: 'Ferrari', query: 'Ferrari Formula 1 F1 team news' },
    { id: 'team-redbull-f1', label: 'Red Bull Racing', query: 'Red Bull Racing Formula 1 news' },
    { id: 'team-mercedes-f1', label: 'Mercedes F1', query: 'Mercedes AMG Formula 1 news' },
    { id: 'team-mclaren-f1', label: 'McLaren F1', query: 'McLaren Formula 1 news' },
    { id: 'team-alpine-f1', label: 'Alpine F1', query: 'Alpine Formula 1 news' },
  ],
  tennis: [
    { id: 'player-sinner', label: 'Jannik Sinner', query: 'Jannik Sinner tennis' },
    { id: 'player-alcaraz', label: 'Carlos Alcaraz', query: 'Carlos Alcaraz tennis' },
    { id: 'player-djokovic', label: 'Djokovic', query: 'Novak Djokovic tennis' },
    { id: 'player-swiatek', label: 'Iga Swiatek', query: 'Iga Swiatek tennis' },
  ],
}

interface Preference {
  id: string
  label: string
  query: string
  icon: string
  type: 'topic' | 'team' | 'custom'
}

interface Article {
  title: string
  link: string
  pubDate: string
  source: string
}

interface FeedState {
  articles: Article[]
  loading: boolean
  expanded: boolean
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

// ─── Setup wizard ─────────────────────────────────────────────────────────────
function SetupWizard({ onDone }: { onDone: (prefs: Preference[]) => void }) {
  const [step, setStep] = useState<'categories' | 'topics' | 'teams' | 'custom'>('categories')
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set())
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
  const [customLabel, setCustomLabel] = useState('')
  const [customQuery, setCustomQuery] = useState('')
  const [customs, setCustoms] = useState<{ label: string; query: string }[]>([])

  function toggleCat(id: string) {
    setSelectedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleTopic(id: string) {
    setSelectedTopics(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleTeam(id: string) {
    setSelectedTeams(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function addCustom() {
    if (!customLabel.trim() || !customQuery.trim()) return
    setCustoms(prev => [...prev, { label: customLabel.trim(), query: customQuery.trim() }])
    setCustomLabel('')
    setCustomQuery('')
  }
  function removeCustom(i: number) {
    setCustoms(prev => prev.filter((_, j) => j !== i))
  }

  const activeCats = CATEGORIES.filter(c => selectedCats.has(c.id))
  const relevantTeamCats = ['football', 'motorsport', 'tennis'].filter(id => selectedCats.has(id))

  function finish() {
    const prefs: Preference[] = []
    // Add selected topics
    for (const cat of CATEGORIES) {
      for (const t of cat.topics) {
        if (selectedTopics.has(t.id)) {
          prefs.push({ id: t.id, label: t.label, query: t.query, icon: cat.icon, type: 'topic' })
        }
      }
    }
    // Add selected teams
    for (const [catId, teams] of Object.entries(TEAM_SUGGESTIONS)) {
      const catIcon = CATEGORIES.find(c => c.id === catId)?.icon || '🏟️'
      for (const t of teams) {
        if (selectedTeams.has(t.id)) {
          prefs.push({ id: t.id, label: t.label, query: t.query, icon: catIcon, type: 'team' })
        }
      }
    }
    // Add customs
    customs.forEach((c, i) => {
      prefs.push({ id: `custom-${i}`, label: c.label, query: c.query, icon: '📰', type: 'custom' })
    })
    onDone(prefs)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {(['categories', 'topics', 'teams', 'custom'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === s ? 'bg-gold text-bg' : ((['categories', 'topics', 'teams', 'custom'].indexOf(step) > i) ? 'bg-gold/40 text-gold' : 'bg-surface2 text-muted')}`}>
              {i + 1}
            </div>
            {i < 3 && <div className={`h-px w-8 ${['categories', 'topics', 'teams', 'custom'].indexOf(step) > i ? 'bg-gold/40' : 'bg-surface2'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Categories */}
      {step === 'categories' && (
        <div>
          <h2 className="text-cream text-xl font-bold tracking-wide mb-1">What are you interested in?</h2>
          <p className="text-muted text-sm mb-6">Pick all that apply. You can always change this later.</p>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => toggleCat(cat.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${selectedCats.has(cat.id) ? 'border-gold bg-gold-dim text-cream' : 'border-gold-border bg-surface2 text-muted hover:border-gold/50 hover:text-cream'}`}>
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.label}</span>
                {selectedCats.has(cat.id) && <Check size={14} className="ml-auto text-gold" />}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('topics')} disabled={selectedCats.size === 0}
            className="btn-gold mt-6 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            Next <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Step 2: Topics */}
      {step === 'topics' && (
        <div>
          <h2 className="text-cream text-xl font-bold tracking-wide mb-1">Which topics specifically?</h2>
          <p className="text-muted text-sm mb-6">Select what you want news on.</p>
          <div className="space-y-5">
            {activeCats.map(cat => (
              <div key={cat.id}>
                <p className="label-sm mb-2">{cat.icon} {cat.label}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.topics.map(t => (
                    <button key={t.id} onClick={() => toggleTopic(t.id)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${selectedTopics.has(t.id) ? 'border-gold bg-gold-dim text-gold' : 'border-gold-border text-muted hover:border-gold/50 hover:text-cream'}`}>
                      {selectedTopics.has(t.id) && '✓ '}{t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep('categories')} className="px-4 py-2 text-muted text-sm hover:text-cream transition-colors">← Back</button>
            <button onClick={() => setStep(relevantTeamCats.length > 0 ? 'teams' : 'custom')}
              className="btn-gold flex items-center gap-2">
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Teams */}
      {step === 'teams' && relevantTeamCats.length > 0 && (
        <div>
          <h2 className="text-cream text-xl font-bold tracking-wide mb-1">Any specific teams or players?</h2>
          <p className="text-muted text-sm mb-6">Follow specific teams, drivers, or athletes.</p>
          <div className="space-y-5">
            {relevantTeamCats.map(catId => {
              const teams = TEAM_SUGGESTIONS[catId]
              const cat = CATEGORIES.find(c => c.id === catId)
              return (
                <div key={catId}>
                  <p className="label-sm mb-2">{cat?.icon} {cat?.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {teams.map(t => (
                      <button key={t.id} onClick={() => toggleTeam(t.id)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${selectedTeams.has(t.id) ? 'border-gold bg-gold-dim text-gold' : 'border-gold-border text-muted hover:border-gold/50 hover:text-cream'}`}>
                        {selectedTeams.has(t.id) && '✓ '}{t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep('topics')} className="px-4 py-2 text-muted text-sm hover:text-cream transition-colors">← Back</button>
            <button onClick={() => setStep('custom')} className="btn-gold flex items-center gap-2">
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Custom */}
      {step === 'custom' && (
        <div>
          <h2 className="text-cream text-xl font-bold tracking-wide mb-1">Anything else?</h2>
          <p className="text-muted text-sm mb-6">Add any custom topic not in the list — a niche league, a specific player, a company, anything.</p>

          <div className="flex gap-2 mb-4">
            <input value={customLabel} onChange={e => setCustomLabel(e.target.value)}
              placeholder="Name (e.g. Valentino Rossi)" className="input-base flex-1 text-sm" />
            <input value={customQuery} onChange={e => setCustomQuery(e.target.value)}
              placeholder="Search term (e.g. Valentino Rossi MotoGP news)" className="input-base flex-1 text-sm"
              onKeyDown={e => e.key === 'Enter' && addCustom()} />
            <button onClick={addCustom} className="btn-gold px-3"><Plus size={14} /></button>
          </div>

          {customs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {customs.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-surface2 border border-gold-border rounded-full px-3 py-1 text-sm">
                  <span className="text-cream text-xs">📰 {c.label}</span>
                  <button onClick={() => removeCustom(i)} className="text-muted hover:text-negative ml-1"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(relevantTeamCats.length > 0 ? 'teams' : 'topics')} className="px-4 py-2 text-muted text-sm hover:text-cream transition-colors">← Back</button>
            <button onClick={finish} className="btn-gold flex items-center gap-2">
              <Check size={14} /> Finish Setup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Feed section ─────────────────────────────────────────────────────────────
function FeedSection({ pref, feed, onToggle, onRefresh }: {
  pref: Preference
  feed?: FeedState
  onToggle: () => void
  onRefresh: () => void
}) {
  const expanded = feed?.expanded ?? true
  const loading = feed?.loading ?? true
  const articles = feed?.articles ?? []

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{pref.icon}</span>
          <h3 className="text-cream font-semibold tracking-wide text-sm uppercase">{pref.label}</h3>
          {!loading && <span className="text-muted text-xs">({articles.length})</span>}
          {loading && <span className="text-muted text-xs animate-pulse">loading…</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onRefresh() }}
            className="text-muted hover:text-gold transition-colors p-1">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 divide-y divide-gold-border">
          {loading && articles.length === 0 && (
            <div className="py-6 text-center text-muted text-sm animate-pulse">Fetching latest news…</div>
          )}
          {!loading && articles.length === 0 && (
            <div className="py-6 text-center text-muted text-sm">No articles found</div>
          )}
          {articles.map((a, i) => (
            <a key={i} href={a.link} target="_blank" rel="noopener noreferrer"
              className="block py-3 group hover:bg-surface2 -mx-4 px-4 transition-colors first:mt-2">
              <p className="text-cream text-sm leading-snug group-hover:text-gold transition-colors line-clamp-2">{a.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {a.source && <span className="text-muted text-xs">{a.source}</span>}
                {a.source && a.pubDate && <span className="text-muted text-xs">·</span>}
                {a.pubDate && <span className="text-muted text-xs">{timeAgo(a.pubDate)}</span>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [prefs, setPrefs] = useState<Preference[]>([])
  const [feeds, setFeeds] = useState<Record<string, FeedState>>({})
  const [setupDone, setSetupDone] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('news-preferences-v2')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPrefs(parsed)
        setSetupDone(true)
      } catch {}
    }
    setLoaded(true)
  }, [])

  const fetchFeed = useCallback(async (pref: Preference) => {
    setFeeds(prev => ({ ...prev, [pref.id]: { ...prev[pref.id], loading: true, expanded: prev[pref.id]?.expanded ?? true, articles: prev[pref.id]?.articles ?? [] } }))
    try {
      const res = await fetch(`/api/news-feed?q=${encodeURIComponent(pref.query)}`)
      const data = await res.json()
      setFeeds(prev => ({ ...prev, [pref.id]: { articles: data.articles || [], loading: false, expanded: prev[pref.id]?.expanded ?? true } }))
    } catch {
      setFeeds(prev => ({ ...prev, [pref.id]: { ...prev[pref.id], loading: false } }))
    }
  }, [])

  function handleSetupDone(newPrefs: Preference[]) {
    setPrefs(newPrefs)
    localStorage.setItem('news-preferences-v2', JSON.stringify(newPrefs))
    setSetupDone(true)
    setShowSettings(false)
    newPrefs.forEach(p => fetchFeed(p))
  }

  useEffect(() => {
    if (setupDone && prefs.length > 0) {
      prefs.forEach(p => fetchFeed(p))
    }
  }, [setupDone]) // eslint-disable-line

  function removePref(id: string) {
    const next = prefs.filter(p => p.id !== id)
    setPrefs(next)
    localStorage.setItem('news-preferences-v2', JSON.stringify(next))
    setFeeds(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  function toggleExpand(id: string) {
    setFeeds(prev => ({ ...prev, [id]: { ...prev[id], expanded: !prev[id]?.expanded } }))
  }

  if (!loaded) return null

  // Show setup wizard if no preferences
  if (!setupDone) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <p className="label-sm mb-1">Personalise</p>
          <h1 className="text-cream text-2xl font-bold tracking-widest uppercase">News Feed Setup</h1>
          <p className="text-muted text-sm mt-1">Let's set up your personal news feed. Takes 30 seconds.</p>
        </div>
        <SetupWizard onDone={handleSetupDone} />
      </div>
    )
  }

  // Show settings (re-run wizard)
  if (showSettings) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setShowSettings(false)} className="text-muted hover:text-cream text-sm transition-colors">← Back</button>
          <div>
            <p className="label-sm mb-1">Edit</p>
            <h1 className="text-cream text-2xl font-bold tracking-widest uppercase">News Preferences</h1>
          </div>
        </div>
        <SetupWizard onDone={handleSetupDone} />
      </div>
    )
  }

  const topics = prefs.filter(p => p.type === 'topic' || p.type === 'custom')
  const teams = prefs.filter(p => p.type === 'team')

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="label-sm mb-1">Live Feed</p>
          <h1 className="text-cream text-2xl font-bold tracking-widest uppercase">News</h1>
        </div>
        <button onClick={() => setShowSettings(true)} className="btn-gold flex items-center gap-2">
          <Settings size={14} /> Edit Preferences
        </button>
      </div>

      {prefs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted">No feeds. Click Edit Preferences to add topics.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.length > 0 && (
            <div>
              <p className="label-sm mb-3">Topics</p>
              <div className="space-y-3">
                {topics.map(pref => (
                  <div key={pref.id} className="relative group">
                    <FeedSection pref={pref} feed={feeds[pref.id]} onToggle={() => toggleExpand(pref.id)} onRefresh={() => fetchFeed(pref)} />
                    <button onClick={() => removePref(pref.id)}
                      className="absolute top-3 right-10 opacity-0 group-hover:opacity-100 text-muted hover:text-negative transition-all p-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {teams.length > 0 && (
            <div className="mt-6">
              <p className="label-sm mb-3">Teams & Players</p>
              <div className="space-y-3">
                {teams.map(pref => (
                  <div key={pref.id} className="relative group">
                    <FeedSection pref={pref} feed={feeds[pref.id]} onToggle={() => toggleExpand(pref.id)} onRefresh={() => fetchFeed(pref)} />
                    <button onClick={() => removePref(pref.id)}
                      className="absolute top-3 right-10 opacity-0 group-hover:opacity-100 text-muted hover:text-negative transition-all p-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
