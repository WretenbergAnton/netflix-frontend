import { useState, useEffect } from 'react'

const cache = new Map()
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

// Concurrency-limited queue — max 8 TMDB requests at once to avoid rate limiting
const CONCURRENCY = 8
let running = 0
const queue = []

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject })
    drain()
  })
}

function drain() {
  while (running < CONCURRENCY && queue.length > 0) {
    const { fn, resolve, reject } = queue.shift()
    running++
    fn().then(resolve, reject).finally(() => { running--; drain() })
  }
}

async function tmdbSearch(title, year, signal) {
  const headers = { Authorization: `Bearer ${TOKEN}` }
  const opts = { headers, signal }

  let result = null

  if (year) {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?${new URLSearchParams({ query: title, year })}`,
      opts
    )
    const json = await res.json()
    result = json.results?.[0] ?? null
  }

  if (!result) {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?${new URLSearchParams({ query: title })}`,
      opts
    )
    const json = await res.json()
    result = json.results?.[0] ?? null
  }

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

  return result
}

export function useTMDB(title, year) {
  const key = `${title}-${year}`
  const [data, setData] = useState(cache.get(key) ?? null)

  useEffect(() => {
    if (cache.has(key) || !title) return

    const controller = new AbortController()

    enqueue(() => tmdbSearch(title, year, controller.signal))
      .then((result) => {
        const entry = result ? {
          poster: result.poster_path ? `https://image.tmdb.org/t/p/w300${result.poster_path}` : null,
          backdrop: result.backdrop_path ? `https://image.tmdb.org/t/p/w780${result.backdrop_path}` : null,
          rating: result.vote_average ?? null,
          voteCount: result.vote_count ?? null,
          overview: result.overview ?? null,
        } : { poster: null, backdrop: null, rating: null, voteCount: null, overview: null }

        cache.set(key, entry)
        setData(entry)
      })
      .catch(() => {
        cache.set(key, { poster: null, backdrop: null, rating: null, voteCount: null, overview: null })
      })

    return () => controller.abort()
  }, [key, title, year])

  return data
}
