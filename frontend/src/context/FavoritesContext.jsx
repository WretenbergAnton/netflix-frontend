import { createContext, useContext } from 'react'
import { useFavorites } from '../hooks/useFavorites.js'

const Ctx = createContext(null)

// Wraps the app so any component can access the favorites state
export function FavoritesProvider({ children }) {
  const value = useFavorites()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// Hook to access favorites, toggle, and isSaved from any component
export function useFavoritesContext() {
  return useContext(Ctx)
}
