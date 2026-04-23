import { createContext, useContext, useState } from 'react'

const CustomMoviesContext = createContext()

// Wraps the app so any component can add, remove, and read user-created movies
export function CustomMoviesProvider({ children }) {
  const [customMovies, setCustomMovies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customMovies') ?? '[]') }
    catch { return [] }
  })

  // Assign a unique ID and save the new movie to state and localStorage
  function addMovie(movie) {
    const entry = { ...movie, id: `custom-${Date.now()}`, isCustom: true }
    const next = [...customMovies, entry]
    setCustomMovies(next)
    localStorage.setItem('customMovies', JSON.stringify(next))
  }

  // Remove a custom movie by ID from state and localStorage
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

// Hook to access customMovies, addMovie, and removeMovie from any component
export function useCustomMovies() {
  return useContext(CustomMoviesContext)
}
