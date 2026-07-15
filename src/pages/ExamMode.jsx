import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTION_SETS } from '../data/mcq'
import { ET_SETS } from '../data/examtopics'
import useStore from '../store/useStore'

const EXAM_COUNT = 65
const EXAM_SECONDS = 130 * 60

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ExamMode() {
  const navigate = useNavigate()
  const { saveExam, saveWrong } = useStore()
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS)
  const [finished, setFinished] = useState(false)
  const [results, setResults] = useState(null)
  const timerRef = useRef(null)

  const finish = useCallback((qs, ans, elapsed) => {
    clearInterval(timerRef.current)
    let correct = 0
    qs.forEach((q, i) => {
      const given = ans[i] || []
      const isCorrect = given.length === q.answer.length && q.answer.every(a => given.includes(a))
      if (isCorrect) correct++
      else saveWrong(`exam-${i}`, { q, given, correct: q.answer, mode: 'exam', key: 'exam' })
    })
    const total = qs.length
    const pct = Math.round(correct / total * 100)
    const data = { correct, total, pct, time: elapsed, date: Date.now() }
    saveExam(data)
    setResults(data)
    setFinished(true)
  }, [saveExam, saveWrong])

  useEffect(() => {
    if (!started) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          finish(questions, answers, EXAM_SECONDS)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, questions, answers, finish])

  const startExam = () => {
    const all = [...QUESTION_SETS.flat(), ...ET_SETS.flat()]
    const qs = shuffle(all).slice(0, EXAM_COUNT)
    setQuestions(qs)
    setStarted(true)
    setTimeLeft(EXAM_SECONDS)
  }

  const select = (letter) => {
    if (finished) return
    const q = questions[idx]
    setAnswers(a => {
      const cur = a[idx] || []
      if (q.multi) return {...a, [idx]: cur.includes(letter) ? cur.filter(x=>x!==letter) : [...cur, letter]}
      return {...a, [idx]: [letter]}
    })
  }

  useEffect(() => {
    if (!started) return
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      const kMap = { a:'A', b:'B', c:'C', d:'D' }
      if (kMap[e.key]) select(kMap[e.key])
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (idx < questions.length - 1) setIdx(i => i + 1)
      }
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [started, idx, questions])

  if (!started) return <StartScreen onStart={startExam} />
  if (finished && results) return <ExamResults results={results} onRetake={() => { setStarted(false); setFinished(false); setAnswers({}); setIdx(0) }} />

  const q = questions[idx]
  const letters = ['A','B','C','D','E','F'].slice(0, Object.keys(q.options).length)
  const cur = answers[idx] || []
  const mins = Math.floor(timeLeft/60), secs = timeLeft%60
  const urgent = timeLeft < 600

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-400 text-sm">{idx+1} / {questions.length}</p>
        <div className={`font-mono font-bold text-lg px-4 py-1.5 rounded-lg ${urgent ? 'text-red-400 bg-red-900/20 border border-red-800 animate-pulse' : 'text-white bg-slate-800'}`}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
        <button onClick={() => finish(questions, answers, EXAM_SECONDS - timeLeft)}
          className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500">
          Submit Exam
        </button>
      </div>

      <div className="h-1 rounded-full mb-6" style={{background:'#1e2a3a'}}>
        <div className="h-full rounded-full transition-all" style={{width:`${(idx/questions.length)*100}%`, background:'#a78bfa'}}/>
      </div>

      <div className="rounded-xl border border-slate-800 p-5 mb-4" style={{background:'#111827'}}>
        {q.multi && <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700 mb-3">Multi-select</span>}
        <p className="text-white leading-relaxed">{q.text}</p>
      </div>

      <div className="space-y-2.5 mb-6">
        {letters.map(letter => {
          const isSelected = cur.includes(letter)
          return (
            <button key={letter} onClick={() => select(letter)}
              className={`w-full text-left rounded-lg border px-4 py-3 transition-all flex items-start gap-3 ${isSelected ? 'border-orange-400 bg-orange-900/20' : 'border-slate-700 hover:border-slate-500'}`}>
              <span className={`font-bold min-w-[1.2rem] ${isSelected ? 'text-orange-300' : 'text-slate-400'}`}>{letter}.</span>
              <span className={`text-sm leading-relaxed ${isSelected ? 'text-orange-100' : 'text-slate-200'}`}>{q.options[letter]}</span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-2 justify-between">
        <button onClick={() => setIdx(i => Math.max(0,i-1))} disabled={idx===0}
          className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 disabled:opacity-30">← Prev</button>
        <div className="flex-1 overflow-x-auto flex gap-1 px-2">
          {questions.map((_,i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`min-w-[2rem] h-8 rounded text-xs font-semibold transition-colors ${i === idx ? 'bg-orange-500 text-black' : answers[i]?.length ? 'bg-blue-900 text-blue-300' : 'bg-slate-800 text-slate-500'}`}>
              {i+1}
            </button>
          ))}
        </div>
        <button onClick={() => setIdx(i => Math.min(questions.length-1, i+1))} disabled={idx===questions.length-1}
          className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 disabled:opacity-30">Next →</button>
      </div>
    </div>
  )
}

function StartScreen({ onStart }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-6">⏱️</p>
      <h1 className="text-3xl font-black text-white mb-3">Exam Simulation</h1>
      <p className="text-slate-400 mb-8 leading-relaxed">
        65 random questions drawn from all 8 MCQ sets. 130-minute countdown, just like the real SAA-C03 exam. Questions are not explained until you submit.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-10 text-center">
        {[['65', 'Questions'], ['130', 'Minutes'], ['72%', 'Pass mark']].map(([n,l]) => (
          <div key={l} className="rounded-xl border border-slate-800 p-4" style={{background:'#111827'}}>
            <p className="text-2xl font-black text-white">{n}</p>
            <p className="text-xs text-slate-500 mt-0.5">{l}</p>
          </div>
        ))}
      </div>
      <button onClick={onStart} className="w-full py-4 rounded-xl font-bold text-black text-lg" style={{background:'linear-gradient(135deg,#a78bfa,#7c3aed)'}}>
        Start Exam
      </button>
    </div>
  )
}

function ExamResults({ results, onRetake }) {
  const { correct, total, pct, time } = results
  const pass = pct >= 72
  const mins = Math.floor(time/60), secs = time%60
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-7xl mb-6">{pass ? '🎉' : '📚'}</p>
      <h1 className="text-5xl font-black mb-2" style={{color: pass ? '#22c55e' : '#ef4444'}}>{pct}%</h1>
      <p className={`text-xl font-bold mb-1 ${pass ? 'text-green-400' : 'text-red-400'}`}>{pass ? 'PASS' : 'FAIL'}</p>
      <p className="text-slate-400 mb-2">{correct} / {total} correct</p>
      <p className="text-slate-500 text-sm mb-10">Time used: {mins}m {secs}s</p>
      <button onClick={onRetake} className="px-8 py-3 rounded-xl font-bold text-black" style={{background:'#ff9900'}}>
        Retake Exam
      </button>
    </div>
  )
}
