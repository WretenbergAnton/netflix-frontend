import { useState, useEffect } from 'react'

const cache = new Map()
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

export function useTMDB(title, year) {
  const key = `${title}-${year}`
  const [data, setData] = useState(cache.get(key) ?? null)

  useEffect(() => {
    if (cache.has(key) || !title) return

    const controller = new AbortController()

    async function fetch_() {
      try {
        const headers = { Authorization: `Bearer ${TOKEN}` }
        const opts = { headers, signal: controller.signal }

        let result = null

        // Try with year first for accuracy
        if (year) {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?${new URLSearchParams({ query: title, year })}`,
            opts
          )
          const json = await res.json()
          result = json.results?.[0] ?? null
        }

        // Fall back to title-only
        if (!result) {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?${new URLSearchParams({ query: title })}`,
            opts
          )
          const json = await res.json()
          result = json.results?.[0] ?? null
        }

        // Fall back to base title before colon/dash (e.g. "John Wick" from "John Wick: Chapter 4")
        if (!result) {
          const base = title.split(/[:\-–]/)[0].trim()
          if (base !== title) {
            const res = await fetch(
              `https://api.themoviedb.org/3/search/movie?${new URLSearchParams({ query: base, ...(year ? { year } : {}) })}`,
              opts
            )
            const json = await res.json()
            result = json.results?.[0] ?? null
          }
        }

        const entry = result ? {
          poster: result.poster_path ? `https://image.tmdb.org/t/p/w300${result.poster_path}` : null,
          backdrop: result.backdrop_path ? `https://image.tmdb.org/t/p/w780${result.backdrop_path}` : null,
          rating: result.vote_average ?? null,
          voteCount: result.vote_count ?? null,
          overview: result.overview ?? null,
        } : { poster: null, backdrop: null, rating: null, voteCount: null, overview: null }

        cache.set(key, entry)
        setData(entry)
      } catch {
        cache.set(key, { poster: null, rating: null, voteCount: null })
      }
    }

    fetch_()
    return () => controller.abort()
  }, [key, title, year])

  return data
}
