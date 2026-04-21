import { useState, useEffect } from 'react'

const cache = new Map()
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

export function useTrailer(tmdbId) {
  const [videoKey, setVideoKey] = useState(cache.get(tmdbId) ?? null)

  useEffect(() => {
    if (!tmdbId || cache.has(tmdbId)) return
    const controller = new AbortController()

    fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        const trailer = json.results?.find(
          (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        )
        const key = trailer?.key ?? null
        cache.set(tmdbId, key)
        setVideoKey(key)
      })
      .catch(() => cache.set(tmdbId, null))

    return () => controller.abort()
  }, [tmdbId])

  return videoKey
}
