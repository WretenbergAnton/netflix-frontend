import { useState, useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import MovieCard from './MovieCard.jsx'
import PopularRow from './PopularRow.jsx'

const MOVIES_QUERY = gql`
  query Movies($limit: Int, $offset: Int) {
    movies(limit: $limit, offset: $offset) {
      totalCount
      hasNextPage
      movies {
        id title releaseYear rating voteAverage popularity
        genres { name }
      }
    }
  }
`

function MovieRow({ title, movies }) {
  const ref = useRef()
  return (
    <div className="mb-10">
      <h2 className="text-white font-semibold text-lg mb-3">{title}</h2>
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

const PAGE_SIZE = 100

export default function MovieList() {
  const [offset, setOffset] = useState(0)
  const { data, loading } = useQuery(MOVIES_QUERY, {
    variables: { limit: PAGE_SIZE, offset },
  })

  if (loading) return (
    <div className="space-y-10">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-4 w-32 rounded mb-3 animate-pulse bg-gray-800" />
          <div className="flex gap-3">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="rounded flex-shrink-0 animate-pulse bg-gray-800" style={{ width: 160, height: 240 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  if (!data) return null

  const { movies: raw, totalCount, hasNextPage } = data.movies

  const movies = [...raw].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))

  const genreMap = {}
  movies.forEach((m) => {
    m.genres.forEach((g) => {
      if (!genreMap[g.name]) genreMap[g.name] = []
      genreMap[g.name].push(m)
    })
  })

  const HIDDEN_GENRES = new Set(['Romance'])

  const rows = Object.entries(genreMap)
    .filter(([genre, ms]) => ms.length >= 4 && !HIDDEN_GENRES.has(genre))
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 8)

  return (
    <div>
      <PopularRow />
      {rows.map(([genre, ms]) => <MovieRow key={genre} title={genre} movies={ms} />)}

      <div className="flex justify-center items-center gap-6 py-6">
        <button
          onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
          disabled={offset === 0}
          className="px-5 py-2 rounded text-sm font-medium disabled:opacity-30 transition"
          style={{ background: '#E50914' }}
        >← Previous</button>
        <span className="text-gray-500 text-sm">
          {offset + 1}–{Math.min(offset + PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()}
        </span>
        <button
          onClick={() => setOffset((o) => o + PAGE_SIZE)}
          disabled={!hasNextPage}
          className="px-5 py-2 rounded text-sm font-medium disabled:opacity-30 transition"
          style={{ background: '#E50914' }}
        >Next →</button>
      </div>
    </div>
  )
}
