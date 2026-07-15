import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Drill() {
  const { wrongAnswers, clearWrong } = useStore()
  const entries = Object.entries(wrongAnswers)
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState([])
  const [revealed, setRevealed] = useState(false)
  const [cleared, setCleared] = useState(new Set())

  const active = entries.filter(([id]) => !cleared.has(id))

  const submit = useCallback(() => {
    if (revealed || selected.length === 0) return
    setRevealed(true)
  }, [revealed, selected])

  const next = useCallback((markCorrect = false) => {
    const [id] = active[idx] || []
    if (markCorrect && id) setCleared(c => new Set([...c, id]))
    if (idx + 1 < active.length) {
      setIdx(i => i + 1)
    } else {
      setIdx(0)
    }
    setSelected([])
    setRevealed(false)
  }, [idx, active])

  const clearAll = () => {
    if (window.confirm('Clear all wrong answers? This cannot be undone.')) {
      entries.forEach(([id]) => clearWrong(id))
      setCleared(new Set())
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      const kMap = { a:'A', b:'B', c:'C', d:'D' }
      const cur = active[idx]
      if (!cur) return
      const [, wr] = cur
      if (kMap[e.key] && !revealed && wr?.q) {
        const letter = kMap[e.key]
        const letters = Object.keys(wr.q.options || {})
        if (letters.includes(letter)) {
          if (wr.q.multi) setSelected(s => s.includes(letter) ? s.filter(x=>x!==letter) : [...s, letter])
          else setSelected([letter])
        }
      }
      if (e.key === 'Enter') {
        if (!revealed && selected.length > 0) submit()
        else if (revealed) next()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, active, revealed, selected, submit, next])

  if (entries.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🎯</p>
        <h1 className="text-2xl font-black text-white mb-2">No wrong answers</h1>
        <p className="text-slate-400 mb-6">Complete some quizzes first, and incorrect answers will appear here for drilling.</p>
        <Link to="/" className="px-6 py-2.5 rounded-xl font-semibold text-black" style={{background:'#ff9900'}}>Go to Home</Link>
      </div>
    )
  }

  if (active.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-2xl font-black text-white mb-2">Drill complete!</h1>
        <p className="text-slate-400 mb-6">You've reviewed all wrong answers in this session.</p>
        <button onClick={() => setCleared(new Set())} className="px-6 py-2.5 rounded-xl font-semibold text-black" style={{background:'#ff9900'}}>Restart drill</button>
      </div>
    )
  }

  const [id, wr] = active[idx] || []
  const q = wr?.q
  if (!q) return <div className="p-10 text-center text-slate-400">Error loading question.</div>

  const letters = Object.keys(q.options)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-lg">Weak-Topic Drill</h1>
          <p className="text-slate-400 text-sm">{idx+1} of {active.length} queued</p>
        </div>
        <button onClick={clearAll} className="text-xs text-slate-500 hover:text-red-400 px-3 py-1.5 rounded border border-slate-700 hover:border-red-800 transition-colors">
          Clear all
        </button>
      </div>

      <div className="h-1 rounded-full mb-6" style={{background:'#1e2a3a'}}>
        <div className="h-full rounded-full" style={{width:`${((idx)/active.length)*100}%`, background:'#ef4444'}}/>
      </div>

      <div className="text-xs text-slate-600 mb-3">Previously answered: <span className="text-red-400">{wr.given?.join(', ') || '—'}</span> • Correct: <span className="text-green-400">{wr.correct?.join(', ')}</span></div>

      <div className="rounded-xl border border-slate-800 p-5 mb-4" style={{background:'#111827'}}>
        {q.multi && <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700 mb-3">Multi-select</span>}
        <p className="text-white leading-relaxed">{q.text}</p>
      </div>

      <div className="space-y-2.5 mb-5">
        {letters.map(letter => {
          const isSelected = selected.includes(letter)
          const isCorrect = q.answer.includes(letter)
          let bdr = 'border-slate-700 hover:border-slate-500'
          if (revealed) {
            if (isCorrect) bdr = 'border-green-500 bg-green-900/20'
            else if (isSelected) bdr = 'border-red-500 bg-red-900/20'
          } else if (isSelected) bdr = 'border-orange-400 bg-orange-900/20'

          return (
            <button key={letter} onClick={() => {
              if (revealed) return
              if (q.multi) setSelected(s => s.includes(letter) ? s.filter(x=>x!==letter) : [...s, letter])
              else setSelected([letter])
            }}
              className={`w-full text-left rounded-lg border px-4 py-3 flex items-start gap-3 transition-all ${bdr}`}>
              <span className="font-bold min-w-[1.2rem] text-slate-400">{letter}.</span>
              <span className="text-sm text-slate-200 leading-relaxed">{q.options[letter]}</span>
            </button>
          )
        })}
      </div>

      {revealed && q.explanation && (
        <div className="rounded-xl border border-slate-700 p-4 mb-5" style={{background:'#1a2233'}}>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Explanation</p>
          <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
        </div>
      )}

      <div className="flex gap-3">
        {!revealed ? (
          <button onClick={submit} disabled={selected.length === 0}
            className="flex-1 py-3 rounded-xl font-bold text-black disabled:opacity-30"
            style={{background:'#ff9900'}}>Submit</button>
        ) : (
          <>
            <button onClick={() => next(true)}
              className="flex-1 py-3 rounded-xl font-bold text-green-300 border border-green-800 bg-green-900/20">
              Got it ✓ (remove)
            </button>
            <button onClick={() => next(false)}
              className="flex-1 py-3 rounded-xl font-bold text-red-300 border border-red-800 bg-red-900/20">
              Still wrong → keep
            </button>
          </>
        )}
      </div>
    </div>
  )
}
