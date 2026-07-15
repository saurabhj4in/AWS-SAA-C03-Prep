export default function ProgressRing({ pct, size = 120, stroke = 10, color }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const c = color || (pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444')
  return (
    <div className="relative inline-flex items-center justify-center" style={{width: size, height: size}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)',position:'absolute'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e2a3a" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{transition:'stroke-dashoffset 1s ease, stroke 0.5s ease'}}/>
      </svg>
      <div className="relative flex flex-col items-center">
        <span className="text-2xl font-black" style={{color: c}}>{pct}%</span>
      </div>
    </div>
  )
}
