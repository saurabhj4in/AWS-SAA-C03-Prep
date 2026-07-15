import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QUESTION_SETS } from '../data/mcq'
import { BOOK_QS, CHAPTER_TITLES } from '../data/book'
import { ET_SETS } from '../data/examtopics'
import useStore from '../store/useStore'

export default function Quiz() {
  const { mode, key } = useParams()
  const navigate = useNavigate()
  const { saveScore, saveWrong, toggleBookmark, isBookmarked } = useStore()

  const questions = mode === 'mcq'
    ? QUESTION_SETS[parseInt(key)]
    : mode === 'et'
    ? ET_SETS[parseInt(key)]
    : BOOK_QS.filter(q => String(q.chapter) === String(key))

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState([])
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [start] = useState(Date.now())
  const [finished, setFinished] = useState(false)
  const [wrongs, setWrongs] = useState([])

  const q = questions[idx]
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, Object.keys(q?.options || {}).length)
  const bm = q && isBookmarked(mode, key, idx)

  const submit = useCallback(() => {
    if (!q || revealed) return
    setRevealed(true)
    const correct = selected.length === q.answer.length && q.answer.every(a => selected.includes(a))
    if (correct) setScore(s => s + 1)
    else {
      const wid = `${mode}-${key}-${idx}`
      saveWrong(wid, { q, given: selected, correct: q.answer, mode, key })
      setWrongs(w => [...w, idx])
    }
  }, [q, revealed, selected, idx, mode, key, saveWrong])

  const next = useCallback(() => {
    if (idx + 1 < questions.length) {
      setIdx(i => i + 1)
      setSelected([])
      setRevealed(false)
    } else {
      const elapsed = Math.round((Date.now() - start) / 1000)
      const pct = Math.round(score / questions.length * 100)
      saveScore(mode, key, { correct: score, total: questions.length, pct, date: Date.now() })
      navigate(`/results/${mode}/${key}`, { state: { score, total: questions.length, pct, elapsed, wrongs } })
      setFinished(true)
    }
  }, [idx, questions.length, score, start, mode, key, saveScore, navigate, wrongs])

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const kMap = { a:'A', b:'B', c:'C', d:'D', e:'E', f:'F' }
      if (kMap[e.key] && !revealed) {
        const letter = kMap[e.key]
        if (letters.includes(letter)) {
          if (q.multi) {
            setSelected(s => s.includes(letter) ? s.filter(x=>x!==letter) : [...s, letter])
          } else {
            setSelected([letter])
          }
        }
      }
      if (e.key === 'Enter') {
        if (!revealed && selected.length > 0) submit()
        else if (revealed) next()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [revealed, selected, q, letters, submit, next])

  if (!questions || questions.length === 0) {
    return <div className="p-10 text-center text-slate-400">No questions found.</div>
  }

  const title = mode === 'mcq' ? `MCQ Set ${parseInt(key)+1}` : mode === 'et' ? `ExamTopics Set ${parseInt(key)+1}` : `Ch ${key}: ${CHAPTER_TITLES[key]}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-sm text-slate-400 mt-0.5">{idx + 1} / {questions.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Score</p>
            <p className="text-white font-bold">{score}/{idx}</p>
          </div>
          <button onClick={() => toggleBookmark({ mode, key, qIdx: idx })}
            className={`text-xl transition-transform hover:scale-110 ${bm ? 'opacity-100' : 'opacity-30 hover:opacity-70'}`}
            title="Bookmark">🔖</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full mb-8" style={{background:'#1e2a3a'}}>
        <div className="h-full rounded-full transition-all" style={{width:`${(idx/questions.length)*100}%`, background:'#ff9900'}}/>
      </div>

      {/* Question */}
      <div className="rounded-xl border border-slate-800 p-6 mb-5" style={{background:'#111827'}}>
        {q.multi && (
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700 mb-3">
            Multi-select — choose all that apply
          </span>
        )}
        <p className="text-white text-base leading-relaxed">{q.text}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-6">
        {letters.map(letter => {
          const isSelected = selected.includes(letter)
          const isCorrect = q.answer.includes(letter)
          let bg = 'border-slate-700 hover:border-slate-500'
          let textColor = 'text-slate-200'
          if (revealed) {
            if (isCorrect) { bg = 'border-green-500 bg-green-900/20'; textColor = 'text-green-300' }
            else if (isSelected && !isCorrect) { bg = 'border-red-500 bg-red-900/20'; textColor = 'text-red-300' }
          } else if (isSelected) {
            bg = 'border-orange-400 bg-orange-900/20'; textColor = 'text-orange-200'
          }

          return (
            <button key={letter}
              onClick={() => {
                if (revealed) return
                if (q.multi) setSelected(s => s.includes(letter) ? s.filter(x=>x!==letter) : [...s, letter])
                else setSelected([letter])
              }}
              className={`w-full text-left rounded-lg border px-4 py-3 transition-all flex items-start gap-3 ${bg}`}
              style={{background: revealed && isCorrect ? '#14532d33' : revealed && isSelected ? '#7f1d1d33' : undefined}}
            >
              <span className={`font-bold min-w-[1.2rem] ${textColor}`}>{letter}.</span>
              <span className={`text-sm leading-relaxed ${textColor}`}>{q.options[letter]}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {revealed && q.explanation && (
        <div className="rounded-xl border border-slate-700 p-4 mb-5" style={{background:'#1a2233'}}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Explanation</p>
          <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!revealed ? (
          <button onClick={submit} disabled={selected.length === 0}
            className="flex-1 py-3 rounded-xl font-bold text-black transition-all disabled:opacity-30"
            style={{background:'#ff9900'}}>
            Submit {q.multi ? `(${selected.length} selected)` : ''} <kbd className="ml-2 text-xs opacity-60">Enter</kbd>
          </button>
        ) : (
          <button onClick={next}
            className="flex-1 py-3 rounded-xl font-bold transition-all"
            style={{background:'#1e3050', color:'#e2e8f0'}}>
            {idx + 1 < questions.length ? 'Next Question →' : 'Finish & See Results'} <kbd className="ml-2 text-xs opacity-60">Enter</kbd>
          </button>
        )}
      </div>

      <p className="text-center text-xs text-slate-600 mt-3">Keyboard: A B C D to select • Enter to submit/next</p>
    </div>
  )
}
