import { useState, useEffect } from 'react'

const TOKEN = import.meta.env.VITE_TMDB_TOKEN
const cache = new Map()

// Limit how many TMDB requests run at the same time (avoids rate limiting)
let running = 0
const queue = []
const MAX_CONCURRENT = 8

function runNext() {
  while (running < MAX_CONCURRENT && queue.length > 0) {
    const { fn, resolve, reject } = queue.shift()
    running++
    fn().then(resolve, reject).finally(() => { running--; runNext() })
  }
}

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject })
    runNext()
  })
}

// Search TMDB for a movie — tries with year first, then without, then with a shorter title
async function searchTMDB(title, year) {
  const headers = { Authorization: `Bearer ${TOKEN}` }

  // Try 1: search with title + year
  if (year) {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?${new URLSearchParams({ query: title, year })}`, { headers })
    const data = await res.json()
    if (data.results?.[0]) return data.results[0]
  }

  // Try 2: search with title only
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?${new URLSearchParams({ query: title })}`, { headers })
  const data = await res.json()
  if (data.results?.[0]) return data.results[0]

  // Try 3: shorten title (e.g. "Avengers: Endgame" → "Avengers")
  const shortTitle = title.split(/[:\-–]/)[0].trim()
  if (shortTitle !== title) {
    const res2 = await fetch(`https://api.themoviedb.org/3/search/movie?${new URLSearchParams({ query: shortTitle })}`, { headers })
    const data2 = await res2.json()
    if (data2.results?.[0]) return data2.results[0]
  }

  return null
}

export function useTMDB(title, year) {
  const key = `${title}-${year}`
  const [data, setData] = useState(cache.get(key) ?? null)

  useEffect(() => {
    if (!title || cache.has(key)) return
    const controller = new AbortController()

    enqueue(() => searchTMDB(title, year))
      .then((result) => {
        const entry = result ? {
          tmdbId:    result.id,
          poster:    result.poster_path   ? `https://image.tmdb.org/t/p/w300${result.poster_path}`   : null,
          backdrop:  result.backdrop_path ? `https://image.tmdb.org/t/p/w780${result.backdrop_path}` : null,
          rating:    result.vote_average  ?? null,
          voteCount: result.vote_count    ?? null,
          overview:  result.overview      ?? null,
        } : { tmdbId: null, poster: null, backdrop: null, rating: null, voteCount: null, overview: null }

        cache.set(key, entry)
        setData(entry)
      })
      .catch(() => {})

    return () => controller.abort()
  }, [key, title, year])

  return data
}
