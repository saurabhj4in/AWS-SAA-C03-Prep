export default function ScoreBar({ label, pct, color }) {
  const c = color || (pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444')
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span><span style={{color: c}} className="font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{background:'#1e2a3a'}}>
        <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`, background: `linear-gradient(90deg, ${c}, ${c}cc)`}}/>
      </div>
    </div>
  )
}
