import { Link } from 'react-router-dom'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'
import useStore from '../store/useStore'
import { QUESTION_SETS, TOTAL_MCQ } from '../data/mcq'
import { TOTAL_BOOK } from '../data/book'
import { ET_SETS, TOTAL_ET } from '../data/examtopics'

export default function Home() {
  const { mcqScores, bookScores, wrongAnswers, examHistory } = useStore()
  const mcqDone = Object.keys(mcqScores).length
  const bookDone = Object.keys(bookScores).length
  const wrongCount = Object.keys(wrongAnswers).length
  const totalDone = mcqDone + bookDone
  const totalSets = QUESTION_SETS.length + 13 + ET_SETS.length
  const overallPct = totalSets ? Math.round(totalDone / totalSets * 100) : 0

  const mcqAvg = mcqDone ? Math.round(Object.values(mcqScores).reduce((a,b)=>a+b.pct,0)/mcqDone) : 0
  const bookAvg = bookDone ? Math.round(Object.values(bookScores).reduce((a,b)=>a+b.pct,0)/bookDone) : 0
  const lastExam = examHistory[0]

  const chartData = [
    { name: 'MCQ', value: mcqAvg || 0, fill: '#f59e0b' },
    { name: 'Book', value: bookAvg || 0, fill: '#60a5fa' },
    { name: 'Overall', value: overallPct, fill: '#ff9900' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <p className="text-xs font-semibold text-orange-400 tracking-widest uppercase mb-3">AWS Solutions Architect Associate</p>
        <h1 className="text-4xl font-black text-white leading-tight mb-3">
          Your Complete <span className="text-transparent bg-clip-text" style={{backgroundImage:'linear-gradient(90deg,#ff9900,#f59e0b)'}}>SAA-C03</span> Study Hub
        </h1>
        <p className="text-slate-400 text-base max-w-xl">{TOTAL_MCQ + TOTAL_BOOK + TOTAL_ET} exam-style questions across three question banks. Track progress, drill weak spots, and simulate the real exam.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'MCQ Progress', val: `${mcqDone}/${QUESTION_SETS.length}`, sub: 'sets done', color: 'text-amber-400' },
          { label: 'Book Progress', val: `${bookDone}/13`, sub: 'chapters done', color: 'text-blue-400' },
          { label: 'Avg MCQ Score', val: mcqDone ? `${mcqAvg}%` : '--', sub: 'across sets', color: mcqAvg >= 80 ? 'text-green-400' : mcqAvg >= 60 ? 'text-amber-400' : 'text-red-400' },
          { label: 'To Drill', val: wrongCount, sub: 'wrong answers', color: wrongCount > 0 ? 'text-red-400' : 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 border border-slate-800" style={{background:'#111827'}}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Mode cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <ModeCard
          to="/mcq" icon="📋" title="500 Practice MCQs"
          desc="8 sets of exam-style questions with detailed answer explanations."
          stats={[`${QUESTION_SETS.length} sets`, `${TOTAL_MCQ} questions`, mcqDone > 0 ? `avg ${mcqAvg}%` : 'not started']}
          accent="#f59e0b" done={mcqDone} total={QUESTION_SETS.length}
        />
        <ModeCard
          to="/book" icon="📚" title="Book Chapter Quiz"
          desc="280 questions from the official study guide, chapter by chapter."
          stats={['13 chapters', `${TOTAL_BOOK} questions`, bookDone > 0 ? `avg ${bookAvg}%` : 'not started']}
          accent="#60a5fa" done={bookDone} total={13}
        />
        <ModeCard
          to="/exam" icon="⏱️" title="Exam Simulation"
          desc="65 random questions, 130-minute countdown. Mirrors the real SAA-C03."
          stats={['65 questions', '130 minutes', lastExam ? `last: ${lastExam.pct}%` : 'never taken']}
          accent="#a78bfa" done={0} total={0}
        />
        <ModeCard
          to="/drill" icon="🎯" title="Weak-Topic Drill"
          desc="Practice only the questions you've answered wrong before."
          stats={[`${wrongCount} queued`, 'adaptive review', wrongCount > 0 ? 'start drilling' : 'nothing yet']}
          accent="#ef4444" done={0} total={0}
        />
      </div>

      {lastExam && (
        <div className="rounded-xl border border-slate-800 p-4 flex items-center justify-between" style={{background:'#111827'}}>
          <div>
            <p className="text-xs text-slate-500 mb-1">Last exam attempt</p>
            <p className="text-white font-semibold">{lastExam.correct}/{lastExam.total} correct — {lastExam.pct}%</p>
            <p className="text-xs text-slate-500">{new Date(lastExam.date).toLocaleDateString()}</p>
          </div>
          <Link to="/exam" className="px-4 py-2 rounded-lg text-sm font-semibold text-black" style={{background:'linear-gradient(135deg,#a78bfa,#7c3aed)'}}>Retake</Link>
        </div>
      )}
    </div>
  )
}

function ModeCard({ to, icon, title, desc, stats, accent, done, total }) {
  const pct = total > 0 ? Math.round(done/total*100) : null
  return (
    <Link to={to} className="group rounded-xl border border-slate-800 p-5 hover:border-slate-600 transition-all hover:-translate-y-0.5 block" style={{background:'#111827'}}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        {pct !== null && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:`${accent}22`, color: accent}}>{pct}% done</span>
        )}
      </div>
      <h3 className="text-white font-bold text-base mb-1.5 group-hover:text-orange-300 transition-colors">{title}</h3>
      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{desc}</p>
      {pct !== null && total > 0 && (
        <div className="h-1 rounded-full mb-3" style={{background:'#1e2a3a'}}>
          <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background:accent}}/>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {stats.map((s,i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-full border border-slate-700 text-slate-400">{s}</span>
        ))}
      </div>
    </Link>
  )
}
