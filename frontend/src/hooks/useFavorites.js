import { useState, useCallback } from 'react'

const KEY = 'favorites'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  const toggle = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id)
      const next = exists ? prev.filter((m) => m.id !== movie.id) : [...prev, movie]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isSaved = useCallback((id) => favorites.some((m) => m.id === id), [favorites])

  return { favorites, toggle, isSaved }
}
