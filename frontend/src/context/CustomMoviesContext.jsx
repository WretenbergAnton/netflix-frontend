import { createContext, useContext, useState } from 'react'

const CustomMoviesContext = createContext()

export function CustomMoviesProvider({ children }) {
  const [customMovies, setCustomMovies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customMovies') ?? '[]') }
    catch { return [] }
  })

  function addMovie(movie) {
    const entry = { ...movie, id: `custom-${Date.now()}`, isCustom: true }
    const next = [...customMovies, entry]
    setCustomMovies(next)
    localStorage.setItem('customMovies', JSON.stringify(next))
  }

  function removeMovie(id) {
    const next = customMovies.filter((m) => m.id !== id)
    setCustomMovies(next)
    localStorage.setItem('customMovies', JSON.stringify(next))
  }

  return (
    <CustomMoviesContext.Provider value={{ customMovies, addMovie, removeMovie }}>
      {children}
    </CustomMoviesContext.Provider>
  )
}

export function useCustomMovies() {
  return useContext(CustomMoviesContext)
}
