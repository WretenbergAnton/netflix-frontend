import { useState, useEffect } from 'react'

const TOKEN = import.meta.env.VITE_TMDB_TOKEN

// Remember results so we don't fetch the same trailer twice
const cache = new Map()

// Given a TMDB movie ID, returns a YouTube video key (or null if no trailer found)
export function useTrailer(tmdbId) {
  const [videoKey, setVideoKey] = useState(cache.get(tmdbId) ?? null)

  useEffect(() => {
    // Skip if we have no ID or already fetched it
    if (!tmdbId || cache.has(tmdbId)) return

    fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
      .then((r) => r.json())
      .then((json) => {
        // Find the first YouTube trailer or teaser
        const trailer = json.results?.find(
          (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        )
        const key = trailer?.key ?? null
        cache.set(tmdbId, key)
        setVideoKey(key)
      })
      .catch(() => cache.set(tmdbId, null))
  }, [tmdbId])

  return videoKey
}
