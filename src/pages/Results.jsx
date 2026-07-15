import { useParams, useLocation, Link } from 'react-router-dom'
import ProgressRing from '../components/ProgressRing'
import useStore from '../store/useStore'
import { QUESTION_SETS } from '../data/mcq'
import { BOOK_QS, CHAPTER_TITLES } from '../data/book'
import { ET_SETS } from '../data/examtopics'

export default function Results() {
  const { mode, key } = useParams()
  const { state } = useLocation()
  const { wrongAnswers } = useStore()

  if (!state) return <div className="p-10 text-center text-slate-400">No result data. <Link to="/" className="text-orange-400">Go home</Link></div>

  const { score, total, pct, elapsed, wrongs = [] } = state
  const questions = mode === 'mcq' ? QUESTION_SETS[parseInt(key)] : mode === 'et' ? ET_SETS[parseInt(key)] : BOOK_QS.filter(q => String(q.chapter) === String(key))
  const mins = Math.floor(elapsed / 60), secs = elapsed % 60
  const grade = pct >= 80 ? { label: 'Excellent', color: 'text-green-400' } : pct >= 72 ? { label: 'Pass', color: 'text-amber-400' } : { label: 'Needs Work', color: 'text-red-400' }
  const title = mode === 'mcq' ? `Set ${parseInt(key)+1}` : `Chapter ${key}: ${CHAPTER_TITLES[key]}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">{title} — Results</p>
        <div className="flex justify-center mb-4">
          <ProgressRing pct={pct} size={160} stroke={14} />
        </div>
        <p className={`text-4xl font-black mb-1 ${grade.color}`}>{pct}%</p>
        <p className={`text-lg font-semibold ${grade.color}`}>{grade.label}</p>
        <p className="text-slate-400 mt-2">{score} / {total} correct</p>
        {elapsed > 0 && <p className="text-slate-500 text-sm mt-1">Time: {mins}m {secs}s</p>}
      </div>

      <div className="flex gap-3 justify-center mb-10">
        <Link to={mode === 'mcq' ? '/mcq' : '/book'}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-700 text-slate-200 hover:border-slate-500 transition-colors">
          ← Back to list
        </Link>
        <Link to={`/quiz/${mode}/${key}`}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm text-black"
          style={{background:'#ff9900'}}>
          Retry
        </Link>
        {wrongs.length > 0 && (
          <Link to="/drill" className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-red-900/30 text-red-300 border border-red-800 hover:border-red-600 transition-colors">
            Drill {wrongs.length} wrong
          </Link>
        )}
      </div>

      {wrongs.length > 0 && (
        <div>
          <h2 className="text-white font-bold text-lg mb-4">Wrong answers ({wrongs.length})</h2>
          <div className="space-y-4">
            {wrongs.map(wIdx => {
              const q = questions[wIdx]
              const wid = `${mode}-${key}-${wIdx}`
              const wr = wrongAnswers[wid]
              if (!q) return null
              return (
                <div key={wIdx} className="rounded-xl border border-red-900/50 p-4" style={{background:'#1a0a0a'}}>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">{q.text}</p>
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <span className="px-2 py-0.5 rounded bg-red-900/40 text-red-300">Your answer: {wr?.given?.join(', ') || '—'}</span>
                    <span className="px-2 py-0.5 rounded bg-green-900/40 text-green-300">Correct: {q.answer.join(', ')}</span>
                  </div>
                  {q.explanation && <p className="text-slate-500 text-xs leading-relaxed">{q.explanation}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
