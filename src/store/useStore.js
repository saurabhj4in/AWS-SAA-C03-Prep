import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      mcqScores: {},      // { setIdx: { correct, total, pct, date } }
      bookScores: {},     // { chapter: { correct, total, pct, date } }
      bookmarks: [],      // [{ mode, key, qIdx }]
      wrongAnswers: {},   // { 'mcq-0-3': { q, given, correct } }
      examHistory: [],    // [{ date, score, pct, total, time }]

      saveScore: (mode, key, data) => set(s => ({
        ...(mode === 'mcq'
          ? { mcqScores: { ...s.mcqScores, [key]: { ...data, date: Date.now() } } }
          : { bookScores: { ...s.bookScores, [key]: { ...data, date: Date.now() } } })
      })),

      saveWrong: (id, data) => set(s => ({
        wrongAnswers: { ...s.wrongAnswers, [id]: data }
      })),

      clearWrong: (id) => set(s => {
        const w = { ...s.wrongAnswers }; delete w[id]; return { wrongAnswers: w }
      }),

      toggleBookmark: (bm) => set(s => {
        const key = `${bm.mode}-${bm.key}-${bm.qIdx}`
        const exists = s.bookmarks.some(b => `${b.mode}-${b.key}-${b.qIdx}` === key)
        return { bookmarks: exists ? s.bookmarks.filter(b => `${b.mode}-${b.key}-${b.qIdx}` !== key) : [...s.bookmarks, bm] }
      }),

      isBookmarked: (mode, key, qIdx) => {
        return get().bookmarks.some(b => b.mode === mode && b.key === key && b.qIdx === qIdx)
      },

      saveExam: (data) => set(s => ({ examHistory: [{ ...data, date: Date.now() }, ...s.examHistory].slice(0, 20) })),

      reset: () => set({ mcqScores: {}, bookScores: {}, bookmarks: [], wrongAnswers: {}, examHistory: [] }),
    }),
    { name: 'aws-prep-v2' }
  )
)

export default useStore
