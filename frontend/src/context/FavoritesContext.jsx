import { createContext, useContext } from 'react'
import { useFavorites } from '../hooks/useFavorites.js'

const Ctx = createContext(null)

export function FavoritesProvider({ children }) {
  const value = useFavorites()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFavoritesContext() {
  return useContext(Ctx)
}
