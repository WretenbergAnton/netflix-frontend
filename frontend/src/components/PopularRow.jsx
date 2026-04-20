import { useState, useEffect, useRef } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import MovieCard from './MovieCard.jsx'

const SEARCH = gql`
  query Search($title: String!) {
    searchMovies(title: $title) {
      id title releaseYear rating voteAverage popularity
      genres { name }
    }
  }
`

const POPULAR_TITLES = [
  'Avengers', 'Iron Man', 'Spider-Man', 'Star Wars',
  'Lord of the Rings', 'The Dark Knight', 'Inception',
  'Wolf of Wall Street', 'Extraction', 'Interstellar',
  'Gladiator', 'John Wick', 'Mad Max', 'Top Gun',
  'Mission Impossible', 'Fast and Furious',
]

export default function PopularRow() {
  const client = useApolloClient()
  const [movies, setMovies] = useState([])
  const ref = useRef()

  useEffect(() => {
    async function load() {
      const results = await Promise.all(
        POPULAR_TITLES.map((title) =>
          client.query({ query: SEARCH, variables: { title } }).catch(() => null)
        )
      )
      const all = results
        .flatMap((r) => r?.data?.searchMovies ?? [])
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)

      setMovies(all)
    }
    load()
  }, [client])

  if (movies.length === 0) return null

  return (
    <div className="mb-10">
      <h2 className="text-white font-semibold text-lg mb-3">Popular</h2>
      <div className="relative group">
        <button
          onClick={() => ref.current.scrollBy({ left: -600, behavior: 'smooth' })}
          className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl"
        >‹</button>
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-8" style={{ scrollbarWidth: 'none' }}>
          {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
        <button
          onClick={() => ref.current.scrollBy({ left: 600, behavior: 'smooth' })}
          className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl"
        >›</button>
      </div>
    </div>
  )
}
