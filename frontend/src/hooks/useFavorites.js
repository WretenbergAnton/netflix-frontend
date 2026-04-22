import { useState, useCallback } from 'react'

// Load saved favorites from localStorage (returns empty array if nothing saved)
function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('favorites') ?? '[]')
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFromStorage)

  // Add a movie if it's not saved, remove it if it is
  const toggle = useCallback((movie) => {
    setFavorites((prev) => {
      const alreadySaved = prev.some((m) => m.id === movie.id)
      const next = alreadySaved
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
      localStorage.setItem('favorites', JSON.stringify(next))
      return next
    })
  }, [])

  // Check if a movie is saved
  const isSaved = useCallback((id) => favorites.some((m) => m.id === id), [favorites])

  return { favorites, toggle, isSaved }
}
