import { Link } from 'react-router-dom'
import { BOOK_QS, CHAPTER_TITLES } from '../data/book'
import useStore from '../store/useStore'
import ProgressRing from '../components/ProgressRing'

export default function BookList() {
  const { bookScores } = useStore()
  const chapters = Object.entries(CHAPTER_TITLES)

  const chapterSizes = {}
  BOOK_QS.forEach(q => {
    chapterSizes[q.chapter] = (chapterSizes[q.chapter] || 0) + 1
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-2">Book Chapter Quiz</h1>
      <p className="text-slate-400 mb-8">280 questions from the official study guide, organized by chapter.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {chapters.map(([ch, title]) => {
          const sc = bookScores[ch]
          const pct = sc ? sc.pct : null
          const count = chapterSizes[ch] || 0
          return (
            <Link key={ch} to={`/quiz/book/${ch}`}
              className="rounded-xl border border-slate-800 p-5 hover:border-blue-500/40 transition-all block group"
              style={{background:'#111827'}}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 pr-3">
                  <p className="text-xs text-blue-400 mb-0.5">Chapter {ch}</p>
                  <p className="text-white font-bold text-sm leading-snug group-hover:text-blue-300 transition-colors">{title}</p>
                  <p className="text-slate-400 text-xs mt-1">{count} questions</p>
                </div>
                <ProgressRing pct={pct || 0} size={64} stroke={6} color="#60a5fa" />
              </div>
              {sc && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-500">{sc.correct}/{sc.total} correct</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-500">{new Date(sc.date).toLocaleDateString()}</span>
                </div>
              )}
              {!sc && <p className="text-xs text-slate-600 mt-2">Not attempted yet</p>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
