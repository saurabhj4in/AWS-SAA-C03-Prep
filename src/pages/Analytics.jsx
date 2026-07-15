import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import useStore from '../store/useStore'
import { CHAPTER_TITLES } from '../data/book'

const GRADE = pct => pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'

export default function Analytics() {
  const { mcqScores, bookScores, examHistory, wrongAnswers } = useStore()

  const mcqData = Object.entries(mcqScores).map(([i, sc]) => ({
    name: `Set ${parseInt(i)+1}`, pct: sc.pct, correct: sc.correct, total: sc.total
  }))
  const bookData = Object.entries(bookScores).map(([ch, sc]) => ({
    name: `Ch ${ch}`, fullName: CHAPTER_TITLES[ch], pct: sc.pct, correct: sc.correct, total: sc.total
  }))
  const examData = [...examHistory].reverse().map((e, i) => ({
    name: `Exam ${i+1}`, pct: e.pct, score: e.correct, date: new Date(e.date).toLocaleDateString()
  }))

  const wrongCount = Object.keys(wrongAnswers).length
  const avgMcq = mcqData.length ? Math.round(mcqData.reduce((a,b)=>a+b.pct,0)/mcqData.length) : null
  const avgBook = bookData.length ? Math.round(bookData.reduce((a,b)=>a+b.pct,0)/bookData.length) : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-2">Analytics</h1>
      <p className="text-slate-400 mb-8">Your performance overview across all question banks.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'MCQ Sets done', val: mcqData.length, sub: '/ 8' },
          { label: 'Avg MCQ score', val: avgMcq !== null ? `${avgMcq}%` : '—', sub: '' },
          { label: 'Chapters done', val: bookData.length, sub: '/ 13' },
          { label: 'Avg Book score', val: avgBook !== null ? `${avgBook}%` : '—', sub: '' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-800 p-4" style={{background:'#111827'}}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black text-white">{s.val}<span className="text-sm text-slate-500">{s.sub}</span></p>
          </div>
        ))}
      </div>

      {mcqData.length > 0 && (
        <Section title="MCQ Sets — Score by Set">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mcqData} barSize={28}>
              <XAxis dataKey="name" tick={{fill:'#64748b', fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{fill:'#64748b', fontSize:11}} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} cursor={{fill:'#ffffff08'}} />
              <Bar dataKey="pct" radius={[4,4,0,0]}>
                {mcqData.map((d,i) => <Cell key={i} fill={GRADE(d.pct)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {bookData.length > 0 && (
        <Section title="Book Chapters — Score by Chapter">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bookData} barSize={22}>
              <XAxis dataKey="name" tick={{fill:'#64748b', fontSize:10}} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{fill:'#64748b', fontSize:11}} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} cursor={{fill:'#ffffff08'}} />
              <Bar dataKey="pct" radius={[4,4,0,0]}>
                {bookData.map((d,i) => <Cell key={i} fill={GRADE(d.pct)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {examData.length > 0 && (
        <Section title="Exam History">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={examData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
              <XAxis dataKey="name" tick={{fill:'#64748b', fontSize:11}} axisLine={false} />
              <YAxis domain={[0,100]} tick={{fill:'#64748b', fontSize:11}} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="pct" stroke="#a78bfa" strokeWidth={2} dot={{fill:'#a78bfa', r:4}} />
            </LineChart>
          </ResponsiveContainer>
        </Section>
      )}

      {mcqData.length === 0 && bookData.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p className="text-5xl mb-4">📊</p>
          <p>No data yet. Complete some quizzes to see your analytics.</p>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-800 p-5 mb-6" style={{background:'#111827'}}>
      <h2 className="text-slate-300 font-semibold text-sm mb-5">{title}</h2>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-700 px-3 py-2 text-xs" style={{background:'#1a2233'}}>
      <p className="text-white font-semibold mb-1">{d.fullName || label}</p>
      <p className="text-slate-300">{payload[0].value}%</p>
      {d.correct !== undefined && <p className="text-slate-400">{d.correct}/{d.total} correct</p>}
      {d.date && <p className="text-slate-500">{d.date}</p>}
    </div>
  )
}
