import { Link } from 'react-router-dom'
import { QUESTION_SETS, TOTAL_MCQ } from '../data/mcq'
import { ET_SETS, TOTAL_ET } from '../data/examtopics'
import useStore from '../store/useStore'
import ProgressRing from '../components/ProgressRing'

function SetCard({ to, label, title, count, score, accentHover, badge }) {
  const pct = score ? score.pct : null
  return (
    <Link to={to}
      className={`rounded-xl border border-slate-800 p-5 transition-all block group ${accentHover}`}
      style={{background:'#111827'}}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs text-slate-500">{label}</p>
            {badge && <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{background:'#1a3a5c', color:'#60a5fa'}}>{badge}</span>}
          </div>
          <p className="text-white font-bold text-base group-hover:text-orange-300 transition-colors">{title}</p>
          <p className="text-slate-400 text-sm">{count} questions</p>
        </div>
        <ProgressRing pct={pct || 0} size={64} stroke={6} />
      </div>
      {score
        ? <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-500">{score.correct}/{score.total} correct</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-500">{new Date(score.date).toLocaleDateString()}</span>
          </div>
        : <p className="text-xs text-slate-600 mt-2">Not attempted yet</p>}
    </Link>
  )
}

export default function McqList() {
  const { mcqScores } = useStore()
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-2">MCQ Practice Sets</h1>
      <p className="text-slate-400 mb-8">{QUESTION_SETS.length + ET_SETS.length} sets — {TOTAL_MCQ + TOTAL_ET} questions. Keyboard shortcuts A–D during quiz.</p>

      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">500 MCQ Bank — 8 sets</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {QUESTION_SETS.map((qs, i) => (
          <SetCard key={i}
            to={`/quiz/mcq/${i}`}
            label={`Set ${i+1}`}
            title={`Practice Set ${i+1}`}
            count={qs.length}
            score={mcqScores[i]}
            accentHover="hover:border-orange-500/40"
          />
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        ExamTopics PDF — {TOTAL_ET} unique questions
        <span className="ml-2 text-xs normal-case text-blue-400 font-normal">from 457-Questions-Guide.pdf · deduplicated</span>
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {ET_SETS.map((qs, i) => (
          <SetCard key={i}
            to={`/quiz/et/${i}`}
            label={`ExamTopics Set ${i+1}`}
            title={`ExamTopics Set ${i+1}`}
            count={qs.length}
            score={mcqScores[`et-${i}`]}
            accentHover="hover:border-blue-500/40"
            badge="PDF"
          />
        ))}
      </div>
    </div>
  )
}
