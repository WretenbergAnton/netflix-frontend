import { useState } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import MovieCard from './MovieCard.jsx'

const SEARCH_QUERY = gql`
  query Search($title: String!) {
    searchMovies(title: $title) {
      id title releaseYear rating voteAverage
      genres { name }
    }
  }
`

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [search, { data, loading }] = useLazyQuery(SEARCH_QUERY)

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length >= 2) {
      search({ variables: { title: val.trim() } })
    }
  }

  const results = data?.searchMovies ?? []

  return (
    <div className="mb-10">
      <div className="relative max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search movies..."
          className="w-full pl-9 pr-4 py-2 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition"
          style={{ background: '#2a2a2a', border: '1px solid #3a3a3a' }}
        />
      </div>

      {query.length >= 2 && (
        <div className="mt-4">
          {loading && <p className="text-gray-500 text-sm">Searching...</p>}
          {!loading && results.length === 0 && (
            <p className="text-gray-500 text-sm">No results for "{query}"</p>
          )}
          {results.length > 0 && (
            <>
              <p className="text-gray-500 text-sm mb-3">{results.length} results for "{query}"</p>
              <div className="flex flex-wrap gap-3">
                {results.map((m) => <MovieCard key={m.id} movie={m} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
