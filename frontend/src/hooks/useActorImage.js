import { useState, useEffect } from 'react'

const cache = new Map()
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

export function useActorImage(name) {
  const [data, setData] = useState(cache.get(name) ?? null)

  useEffect(() => {
    if (!name || cache.has(name)) return
    const controller = new AbortController()

    async function fetch_() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/person?${new URLSearchParams({ query: name })}`,
          { headers: { Authorization: `Bearer ${TOKEN}` }, signal: controller.signal }
        )
        const json = await res.json()
        const person = json.results?.[0] ?? null
        const entry = person ? {
          image: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : null,
          name: person.name,
        } : { image: null, name }
        cache.set(name, entry)
        setData(entry)
      } catch {
        cache.set(name, { image: null, name })
      }
    }

    fetch_()
    return () => controller.abort()
  }, [name])

  return data
}
