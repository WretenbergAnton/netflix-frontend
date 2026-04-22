import { useState, useEffect } from 'react'

const TOKEN = import.meta.env.VITE_TMDB_TOKEN

// Remember results so we don't fetch the same actor twice
const cache = new Map()

// Given an actor name, returns their profile image URL from TMDB
export function useActorImage(name) {
  const [data, setData] = useState(cache.get(name) ?? null)

  useEffect(() => {
    // Skip if we have no name or already fetched it
    if (!name || cache.has(name)) return

    async function loadActor() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/person?${new URLSearchParams({ query: name })}`,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        )
        const json = await res.json()
        const person = json.results?.[0]

        const entry = {
          image: person?.profile_path
            ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
            : null,
          name: person?.name ?? name,
        }

        cache.set(name, entry)
        setData(entry)
      } catch {
        cache.set(name, { image: null, name })
      }
    }

    loadActor()
  }, [name])

  return data
}
