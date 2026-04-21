import { useState, useRef, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import MovieCard from './MovieCard.jsx'

const SEARCH_QUERY = gql`
  query Search($title: String!) {
    searchMovies(title: $title) {
      id title releaseYear rating voteAverage popularity
      genres { name }
    }
  }
`

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [search, { data, loading }] = useLazyQuery(SEARCH_QUERY)
  const ref = useRef()

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length >= 2) {
      search({ variables: { title: val.trim() } })
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  const results = data?.searchMovies ?? []

  return (
    <div ref={ref} className="w-full max-w-md relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { setFocused(true); query.length >= 2 && setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder="Search movies..."
          className="w-full pl-9 pr-4 py-2 rounded-lg text-white text-sm outline-none transition"
          style={{ background: '#2a2a2a', border: `1px solid ${focused || query.length > 0 ? '#E50914' : '#444'}` }}
        />
      </div>

      {open && query.length >= 2 && (
        <div
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-lg overflow-y-auto p-4"
          style={{ background: '#181818', border: '1px solid #333', maxHeight: '80vh' }}
        >
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
