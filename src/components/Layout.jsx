import { Link, useLocation } from 'react-router-dom'
import useStore from '../store/useStore'
import { TOTAL_MCQ, SET_COUNT } from '../data/mcq'
import { TOTAL_BOOK } from '../data/book'

export default function Layout({ children }) {
  const { mcqScores, bookScores, wrongAnswers } = useStore()
  const loc = useLocation()
  const mcqDone = Object.keys(mcqScores).length
  const bookDone = Object.keys(bookScores).length
  const wrongCount = Object.keys(wrongAnswers).length

  const navItem = (to, label, active) => (
    <Link to={to} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-orange-500/10 text-orange-400' : 'text-slate-400 hover:text-slate-200'
    }`}>{label}</Link>
  )

  return (
    <div className="min-h-screen" style={{background:'#0a0e17'}}>
      <header className="sticky top-0 z-50 border-b border-slate-800/60 backdrop-blur-md" style={{background:'rgba(10,14,23,0.92)'}}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-black bg-gradient-to-r from-orange-500 to-orange-600 text-black px-2 py-1 rounded-md">SAA-C03</span>
            <span className="font-bold text-white">AWS <span className="text-orange-400">Prep</span></span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navItem('/', 'Home', loc.pathname === '/')}
            {navItem('/mcq', 'MCQ Sets', loc.pathname.startsWith('/mcq'))}
            {navItem('/book', 'Book Quiz', loc.pathname.startsWith('/book'))}
            {navItem('/exam', 'Exam Mode', loc.pathname.startsWith('/exam'))}
            {navItem('/analytics', 'Analytics', loc.pathname.startsWith('/analytics'))}
          </nav>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden md:block">{mcqDone}/{SET_COUNT} sets</span>
            <span className="hidden md:block">{bookDone}/13 chapters</span>
            {wrongCount > 0 && (
              <Link to="/drill" className="text-red-400 font-semibold hover:text-red-300">{wrongCount} to drill</Link>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
