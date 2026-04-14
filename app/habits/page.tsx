'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, Smile, Zap, Check, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface Habit { id: string; name: string; color: string; order_index: number }

const HABIT_COLORS = ['#C9A96E', '#5DB87A', '#5B9BD5', '#D95F5F', '#A878D4', '#E8A44A', '#4DC0B5', '#F687B3']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function HabitsPage() {
  const { user } = useAuth()
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Set<string>>(new Set())
  const [mood, setMood] = useState<Record<string, number>>({})
  const [motivation, setMotivation] = useState<Record<string, number>>({})
  const [newHabitName, setNewHabitName] = useState('')
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0])
  const [dataLoading, setDataLoading] = useState(true)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const todayStr = today.toISOString().split('T')[0]

  function dateStr(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // Load habits
  const loadHabits = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index')
    setHabits(data ?? [])
  }, [user])

  // Load completions for current month
  const loadCompletions = useCallback(async () => {
    if (!user) return
    const startDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`
    const endDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
    const { data } = await supabase
      .from('habit_completions')
      .select('habit_id, date')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
    const s = new Set<string>()
    data?.forEach(c => s.add(`${c.habit_id}-${c.date}`))
    setCompletions(s)
  }, [user, viewYear, viewMonth, daysInMonth])

  // Load moods for current month
  const loadMoods = useCallback(async () => {
    if (!user) return
    const startDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`
    const endDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
    const { data } = await supabase
      .from('moods')
      .select('date, mood, motivation')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
    const moodMap: Record<string, number> = {}
    const motivMap: Record<string, number> = {}
    data?.forEach(m => {
      if (m.mood != null) moodMap[m.date] = m.mood
      if (m.motivation != null) motivMap[m.date] = m.motivation
    })
    setMood(moodMap)
    setMotivation(motivMap)
  }, [user, viewYear, viewMonth, daysInMonth])

  useEffect(() => {
    if (!user) return
    setDataLoading(true)
    Promise.all([loadHabits(), loadCompletions(), loadMoods()]).then(() => setDataLoading(false))
  }, [user, loadHabits, loadCompletions, loadMoods])

  async function toggleCompletion(habitId: string, day: number) {
    const date = dateStr(day)
    const key = `${habitId}-${date}`
    const isDone = completions.has(key)

    // Optimistic update
    setCompletions(prev => {
      const next = new Set(prev)
      isDone ? next.delete(key) : next.add(key)
      return next
    })

    if (isDone) {
      await supabase.from('habit_completions')
        .delete()
        .eq('user_id', user!.id)
        .eq('habit_id', habitId)
        .eq('date', date)
    } else {
      await supabase.from('habit_completions')
        .upsert({ user_id: user!.id, habit_id: habitId, date })
    }
  }

  async function addHabit() {
    if (!newHabitName.trim() || !user) return
    const order_index = habits.length
    const { data, error } = await supabase
      .from('habits')
      .insert({ user_id: user.id, name: newHabitName.trim(), color: selectedColor, order_index })
      .select()
      .single()
    if (!error && data) {
      setHabits(prev => [...prev, data])
    }
    setNewHabitName('')
    setShowAddHabit(false)
    setSelectedColor(HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)])
  }

  async function removeHabit(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id))
    await supabase.from('habits').delete().eq('id', id).eq('user_id', user!.id)
  }

  async function handleMoodChange(date: string, value: number) {
    const currentMotivation = motivation[date] ?? null
    setMood(prev => ({ ...prev, [date]: value }))
    await supabase.from('moods').upsert(
      { user_id: user!.id, date, mood: value, motivation: currentMotivation },
      { onConflict: 'user_id,date' }
    )
  }

  async function handleMotivationChange(date: string, value: number) {
    const currentMood = mood[date] ?? null
    setMotivation(prev => ({ ...prev, [date]: value }))
    await supabase.from('moods').upsert(
      { user_id: user!.id, date, mood: currentMood, motivation: value },
      { onConflict: 'user_id,date' }
    )
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Stats
  const stats = useMemo(() => {
    if (!habits.length) return { total: 0, completed: 0, pct: 0 }
    let total = 0; let completed = 0
    for (const day of days) {
      for (const h of habits) {
        total++
        if (completions.has(`${h.id}-${dateStr(day)}`)) completed++
      }
    }
    return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, completions, viewYear, viewMonth])

  function habitStats(habitId: string) {
    const done = days.filter(d => completions.has(`${habitId}-${dateStr(d)}`)).length
    return { done, pct: Math.round((done / days.length) * 100) }
  }

  function dayCompletionPct(day: number) {
    if (!habits.length) return 0
    const done = habits.filter(h => completions.has(`${h.id}-${dateStr(day)}`)).length
    return done / habits.length
  }

  if (dataLoading) {
    return (
      <div className="p-5 md:p-8 flex items-center justify-center min-h-96">
        <p className="text-muted animate-pulse-gold">Loading habits...</p>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 border-b border-gold-border pb-5">
        <p className="label-sm mb-1">Protocol — Habit Tracker</p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-cream text-2xl font-light tracking-wide">Habit Tracker</h2>
          <button
            className="btn-gold flex items-center gap-1.5"
            onClick={() => setShowAddHabit(s => !s)}
          >
            {showAddHabit ? <X size={13} /> : <Plus size={13} />}
            {showAddHabit ? 'Cancel' : 'Add Habit'}
          </button>
        </div>
      </div>

      {/* Add habit form */}
      {showAddHabit && (
        <div className="mb-5 card p-4 animate-slide-up">
          <p className="label-sm mb-3">New Habit</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="input-base flex-1"
              placeholder="e.g. Morning Run 🏃, Read 30min 📖, Cold Shower 🚿"
              value={newHabitName}
              onChange={e => setNewHabitName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
            />
            <div className="flex gap-2 items-center">
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: selectedColor === c ? '#F0EBD8' : 'transparent' }}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
            <button className="btn-gold" onClick={addHabit}>Add</button>
          </div>
        </div>
      )}

      {/* Month selector + stats */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded border border-gold-border text-gold hover:bg-gold-dim transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-cream font-medium w-36 text-center">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded border border-gold-border text-gold hover:bg-gold-dim transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-cream font-num">{stats.pct}%</p>
            <p className="label-sm">Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cream font-num">{habits.length}</p>
            <p className="label-sm">Habits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-positive font-num">{stats.completed}</p>
            <p className="label-sm">Completed</p>
          </div>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="card p-10 text-center border-dashed">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-cream font-medium mb-2">No habits yet</p>
          <p className="text-muted text-sm mb-4">Start tracking your habits to build momentum.</p>
          <button className="btn-gold mx-auto" onClick={() => setShowAddHabit(true)}>+ Add Your First Habit</button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${Math.max(600, 680)}px` }}>
              {/* Day headers */}
              <div className="flex mb-1">
                <div style={{ width: '160px', minWidth: '160px' }} />
                <div className="flex flex-1">
                  {days.map(d => {
                    const ds = dateStr(d)
                    const isToday = ds === todayStr
                    const dow = new Date(viewYear, viewMonth, d).getDay()
                    const isWeekend = dow === 0 || dow === 6
                    return (
                      <div
                        key={d}
                        className={`flex flex-col items-center flex-1 text-center ${isToday ? 'text-gold' : isWeekend ? 'text-muted-light' : 'text-muted'}`}
                        style={{ minWidth: '22px', maxWidth: '32px' }}
                      >
                        <span className="text-[9px] uppercase">{DAY_NAMES[dow]}</span>
                        <span className={`text-[11px] font-num font-medium ${isToday ? 'text-gold' : ''}`}>{d}</span>
                      </div>
                    )
                  })}
                  <div style={{ width: '90px', minWidth: '90px' }} />
                </div>
              </div>

              {/* Habit rows */}
              {habits.map((habit, hi) => {
                const hs = habitStats(habit.id)
                return (
                  <div key={habit.id} className={`flex items-center mb-1 ${hi % 2 === 0 ? '' : 'bg-surface2 rounded'}`}>
                    <div
                      style={{ width: '160px', minWidth: '160px', borderLeft: `3px solid ${habit.color}` }}
                      className="flex items-center justify-between pr-2 pl-2 py-1"
                    >
                      <span className="text-cream text-xs truncate flex-1" title={habit.name}>{habit.name}</span>
                      <button onClick={() => removeHabit(habit.id)} className="text-muted hover:text-negative transition-colors ml-1 shrink-0">
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="flex flex-1">
                      {days.map(d => {
                        const key = `${habit.id}-${dateStr(d)}`
                        const done = completions.has(key)
                        const ds = dateStr(d)
                        const isFuture = ds > todayStr
                        return (
                          <div
                            key={d}
                            className={`habit-cell flex-1 border border-transparent rounded-sm m-0.5 flex items-center justify-center ${
                              done ? 'border-gold-border' : isFuture ? 'opacity-30 cursor-default' : ''
                            }`}
                            style={{
                              minWidth: '20px', maxWidth: '30px', height: '22px',
                              background: done ? `${habit.color}30` : 'transparent',
                              borderColor: done ? `${habit.color}60` : undefined,
                              cursor: isFuture ? 'default' : 'pointer',
                            }}
                            onClick={() => !isFuture && toggleCompletion(habit.id, d)}
                          >
                            {done && <Check size={10} style={{ color: habit.color }} />}
                          </div>
                        )
                      })}
                      <div style={{ width: '90px', minWidth: '90px' }} className="flex items-center gap-2 pl-2">
                        <div className="flex-1 h-1.5 bg-surface3 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${hs.pct}%`, background: habit.color }} />
                        </div>
                        <span className="text-[11px] font-num text-muted w-8 text-right">{hs.done}/{days.length}</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Daily completion bar */}
              <div className="flex mt-3 border-t border-gold-border pt-2">
                <div style={{ width: '160px', minWidth: '160px' }} className="flex items-center">
                  <span className="label-sm pl-2">Daily %</span>
                </div>
                <div className="flex flex-1">
                  {days.map(d => {
                    const pct = dayCompletionPct(d)
                    const ds = dateStr(d)
                    const isToday = ds === todayStr
                    return (
                      <div key={d} className="flex-1 flex flex-col items-center justify-end"
                        style={{ minWidth: '20px', maxWidth: '30px', height: '28px' }}
                        title={`${Math.round(pct * 100)}%`}
                      >
                        <div className="w-full rounded-t-sm transition-all duration-300" style={{
                          height: `${Math.max(pct * 24, pct > 0 ? 2 : 0)}px`,
                          background: isToday ? '#C9A96E' : pct >= 0.8 ? '#5DB87A' : pct >= 0.5 ? '#C9A96E80' : '#444',
                        }} />
                      </div>
                    )
                  })}
                  <div style={{ width: '90px', minWidth: '90px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Mood & Motivation */}
          <div className="mt-6 card p-5">
            <p className="label-sm mb-4">Daily Mental State</p>
            <div className="overflow-x-auto">
              <div style={{ minWidth: '500px' }}>
                <div className="flex items-center mb-3">
                  <div className="flex items-center gap-2 w-28 shrink-0">
                    <Smile size={14} className="text-gold" />
                    <span className="text-cream text-xs">Mood</span>
                  </div>
                  <div className="flex gap-1 flex-1">
                    {days.map(d => {
                      const key = dateStr(d)
                      const val = mood[key]
                      const isFuture = key > todayStr
                      return (
                        <div key={d} className="flex flex-col items-center gap-0.5" style={{ flex: 1, minWidth: '18px', maxWidth: '30px' }}>
                          {val != null && <span className="text-[10px] font-num text-gold">{val}</span>}
                          <input
                            type="range" min={1} max={10}
                            value={val ?? 5}
                            disabled={isFuture}
                            onChange={e => handleMoodChange(key, Number(e.target.value))}
                            className="w-full accent-gold cursor-pointer disabled:opacity-20"
                            style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical', height: '40px', direction: 'rtl' } as React.CSSProperties}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-2 w-28 shrink-0">
                    <Zap size={14} className="text-gold" />
                    <span className="text-cream text-xs">Motivation</span>
                  </div>
                  <div className="flex gap-1 flex-1">
                    {days.map(d => {
                      const key = dateStr(d)
                      const val = motivation[key]
                      const isFuture = key > todayStr
                      return (
                        <div key={d} className="flex flex-col items-center gap-0.5" style={{ flex: 1, minWidth: '18px', maxWidth: '30px' }}>
                          {val != null && <span className="text-[10px] font-num text-gold">{val}</span>}
                          <input
                            type="range" min={1} max={10}
                            value={val ?? 5}
                            disabled={isFuture}
                            onChange={e => handleMotivationChange(key, Number(e.target.value))}
                            className="w-full accent-gold cursor-pointer disabled:opacity-20"
                            style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical', height: '40px', direction: 'rtl' } as React.CSSProperties}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-muted text-xs mt-3">Drag the sliders to rate your daily mood (😊) and motivation (⚡) from 1–10.</p>
          </div>
        </>
      )}
    </div>
  )
}
