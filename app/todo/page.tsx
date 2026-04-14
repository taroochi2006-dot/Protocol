'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Trash2, Check, X, Flag, Calendar } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface Todo {
  id: string; text: string; completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string; createdAt: string; completedAt?: string
  category?: string
}

const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#D95F5F', bg: 'rgba(217,95,95,0.12)' },
  medium: { label: 'Medium', color: '#C9A96E', bg: 'rgba(201,169,110,0.12)' },
  low: { label: 'Low', color: '#777777', bg: 'rgba(119,119,119,0.12)' },
}

const CATEGORIES = ['Work', 'Personal', 'Finance', 'Health', 'Learning', 'Other']

export default function TodoPage() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')
  const [sortBy, setSortBy] = useState<'created' | 'due' | 'priority'>('priority')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ text: '', priority: 'medium' as 'low' | 'medium' | 'high', dueDate: '', category: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const loadTodos = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    const mapped: Todo[] = (data ?? []).map(t => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      priority: t.priority ?? 'medium',
      dueDate: t.due_date ?? undefined,
      createdAt: t.created_at,
      completedAt: t.completed_at ?? undefined,
      category: t.category ?? undefined,
    }))
    setTodos(mapped)
    setDataLoading(false)
  }, [user])

  useEffect(() => { loadTodos() }, [loadTodos])

  async function addTodo() {
    if (!form.text.trim() || !user) return
    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        text: form.text.trim(),
        completed: false,
        priority: form.priority,
        due_date: form.dueDate || null,
        category: form.category || null,
      })
      .select()
      .single()
    if (!error && data) {
      const newTodo: Todo = {
        id: data.id,
        text: data.text,
        completed: false,
        priority: data.priority ?? 'medium',
        dueDate: data.due_date ?? undefined,
        createdAt: data.created_at,
        category: data.category ?? undefined,
      }
      setTodos(prev => [newTodo, ...prev])
    }
    setForm({ text: '', priority: 'medium', dueDate: '', category: '' })
    setShowAdd(false)
  }

  async function toggleTodo(id: string) {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    const completed = !todo.completed
    const completedAt = completed ? new Date().toISOString() : null
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed, completedAt: completedAt ?? undefined } : t))
    await supabase.from('todos')
      .update({ completed, completed_at: completedAt })
      .eq('id', id)
      .eq('user_id', user!.id)
  }

  async function deleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
    await supabase.from('todos').delete().eq('id', id).eq('user_id', user!.id)
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: editText.trim() } : t))
    setEditId(null)
    await supabase.from('todos').update({ text: editText.trim() }).eq('id', id).eq('user_id', user!.id)
  }

  async function clearCompleted() {
    const completedIds = todos.filter(t => t.completed).map(t => t.id)
    setTodos(prev => prev.filter(t => !t.completed))
    await supabase.from('todos').delete().in('id', completedIds).eq('user_id', user!.id)
  }

  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

  const filtered = useMemo(() => {
    let list = todos.filter(t =>
      filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed
    )
    list = [...list].sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sortBy === 'due') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return list
  }, [todos, filter, sortBy])

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => !t.completed && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]).length,
  }

  const isOverdue = (todo: Todo) =>
    !todo.completed && todo.dueDate && todo.dueDate < new Date().toISOString().split('T')[0]

  const formatDue = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const diff = Math.floor((d.getTime() - today.getTime()) / 86400000)
    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, color: '#D95F5F' }
    if (diff === 0) return { label: 'Today', color: '#C9A96E' }
    if (diff === 1) return { label: 'Tomorrow', color: '#C9A96E' }
    if (diff <= 7) return { label: `${diff}d`, color: '#8FD4A4' }
    return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: '#777' }
  }

  if (dataLoading) {
    return (
      <div className="p-5 md:p-8 flex items-center justify-center min-h-96">
        <p className="text-muted animate-pulse-gold">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 border-b border-gold-border pb-5">
        <p className="label-sm mb-1">Protocol — Task Management</p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-cream text-2xl font-light tracking-wide">Task List</h2>
          <button className="btn-gold flex items-center gap-1.5" onClick={() => setShowAdd(s => !s)}>
            {showAdd ? <X size={12} /> : <Plus size={12} />}
            {showAdd ? 'Cancel' : 'New Task'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Total', val: stats.total, color: 'text-cream' },
          { label: 'Active', val: stats.active, color: 'text-gold' },
          { label: 'Done', val: stats.completed, color: 'text-positive' },
          { label: 'Overdue', val: stats.overdue, color: stats.overdue > 0 ? 'text-negative' : 'text-muted' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card p-3 text-center">
            <p className={`text-xl font-bold font-num ${color}`}>{val}</p>
            <p className="label-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Add task */}
      {showAdd && (
        <div className="mb-5 card p-4 animate-slide-up">
          <p className="label-sm mb-3">New Task</p>
          <input
            className="input-base mb-3"
            placeholder="What needs to be done?"
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            autoFocus
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            <div>
              <label className="text-muted text-xs block mb-1 uppercase tracking-wider">Priority</label>
              <select className="input-base" value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as 'low' | 'medium' | 'high' }))}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
            <div>
              <label className="text-muted text-xs block mb-1 uppercase tracking-wider">Due Date</label>
              <input type="date" className="input-base" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="text-muted text-xs block mb-1 uppercase tracking-wider">Category</label>
              <select className="input-base" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">None</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-gold" onClick={addTodo}>Add Task</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1">
          {(['active', 'all', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs uppercase tracking-widest rounded transition-all ${
                filter === f ? 'bg-gold-dim border border-gold-border text-gold' : 'text-muted hover:text-cream'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted text-xs">Sort:</span>
          {([['priority', 'Priority'], ['due', 'Due Date'], ['created', 'Newest']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val)}
              className={`px-2 py-1 text-xs rounded transition-all ${sortBy === val ? 'text-gold bg-gold-dim' : 'text-muted hover:text-cream'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center border-dashed">
          <div className="text-5xl mb-4">{filter === 'completed' ? '🎉' : '✅'}</div>
          <p className="text-cream font-medium mb-2">
            {filter === 'completed' ? 'No completed tasks' : filter === 'active' ? 'All clear! No pending tasks.' : 'No tasks yet'}
          </p>
          {filter !== 'completed' && (
            <>
              <p className="text-muted text-sm mb-4">Add your first task to stay organized.</p>
              <button className="btn-gold mx-auto" onClick={() => setShowAdd(true)}>+ Add Task</button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map(todo => {
            const pc = PRIORITY_CONFIG[todo.priority]
            const overdue = isOverdue(todo)
            const dueInfo = todo.dueDate ? formatDue(todo.dueDate) : null
            const isEditing = editId === todo.id

            return (
              <div key={todo.id}
                className={`card p-3.5 flex items-start gap-3 transition-all animate-slide-up group ${
                  todo.completed ? 'opacity-50' : ''
                } ${overdue ? 'border-negative/30' : ''}`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    todo.completed ? 'bg-positive border-positive text-bg' : 'border-gold-border hover:border-gold'
                  }`}
                >
                  {todo.completed && <Check size={11} />}
                </button>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      className="input-base text-sm py-1"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit(todo.id)
                        if (e.key === 'Escape') setEditId(null)
                      }}
                      autoFocus
                    />
                  ) : (
                    <p
                      className={`text-sm cursor-pointer ${todo.completed ? 'line-through text-muted' : 'text-cream'}`}
                      onDoubleClick={() => { setEditId(todo.id); setEditText(todo.text) }}
                    >
                      {todo.text}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                      style={{ color: pc.color, background: pc.bg }}>
                      <Flag size={9} />{pc.label}
                    </span>
                    {todo.category && (
                      <span className="text-xs text-muted bg-surface2 px-1.5 py-0.5 rounded border border-gold-border/30">
                        {todo.category}
                      </span>
                    )}
                    {dueInfo && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: dueInfo.color }}>
                        <Calendar size={9} />{dueInfo.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(todo.id)} className="text-positive hover:text-positive/80 transition-colors"><Check size={14} /></button>
                      <button onClick={() => setEditId(null)} className="text-muted hover:text-cream transition-colors"><X size={14} /></button>
                    </>
                  ) : (
                    <button onClick={() => deleteTodo(todo.id)} className="text-muted hover:text-negative transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {stats.completed > 0 && filter !== 'active' && (
        <div className="mt-4 flex justify-end">
          <button onClick={clearCompleted}
            className="text-muted text-xs hover:text-negative transition-colors uppercase tracking-wider">
            Clear {stats.completed} completed
          </button>
        </div>
      )}

      {todos.length > 0 && (
        <div className="mt-5 card p-3 border-dashed">
          <p className="text-muted text-xs leading-relaxed">
            💡 <span className="text-cream">Tip:</span> Double-click any task to edit it inline.
          </p>
        </div>
      )}
    </div>
  )
}
