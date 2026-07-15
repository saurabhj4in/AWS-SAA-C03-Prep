import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import McqList from './pages/McqList'
import BookList from './pages/BookList'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import Analytics from './pages/Analytics'
import ExamMode from './pages/ExamMode'
import Drill from './pages/Drill'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mcq" element={<McqList />} />
        <Route path="/book" element={<BookList />} />
        <Route path="/quiz/:mode/:key" element={<Quiz />} />
        <Route path="/results/:mode/:key" element={<Results />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/exam" element={<ExamMode />} />
        <Route path="/drill" element={<Drill />} />
      </Routes>
    </Layout>
  )
}
