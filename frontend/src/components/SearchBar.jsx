import { useState, useRef, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import MovieCard from './MovieCard.jsx'

// GraphQL query that searches movies by title
const SEARCH_QUERY = gql`
  query Search($title: String!) {
    searchMovies(title: $title) {
      id title releaseYear rating voteAverage popularity
      genres { name }
      actors { name character }
    }
  }
`

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef()
  const ref = useRef()

  // useLazyQuery lets us run the search manually (not automatically on load)
  const [search, { data, loading }] = useLazyQuery(SEARCH_QUERY)

  // Close when clicking outside (desktop only — mobile uses the ✕ button)
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Run a search 300 ms after the user stops typing (debounce)
  const debounceRef = useRef(null)
  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        search({ variables: { title: val.trim() } })
        setOpen(true)
      }, 300)
    } else {
      setOpen(false)
    }
  }

  function close() {
    setQuery('')
    setOpen(false)
    setFocused(false)
  }

  const results = data?.searchMovies ?? []
  const active = focused || query.length > 0

  return (
    <>
      {/* Desktop search — inline dropdown */}
      <div ref={ref} className="hidden sm:block w-full max-w-md relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { setFocused(true); if (query.length >= 2) setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder="Search movies..."
          className="w-full pl-4 pr-4 py-2 rounded-lg text-white outline-none transition"
          style={{ background: '#2a2a2a', border: `1px solid ${active ? '#E50914' : '#444'}`, fontSize: 16 }}
        />
        {open && query.length >= 2 && (
          <div
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-lg overflow-y-auto p-4"
            style={{ background: '#181818', border: '1px solid #333', maxHeight: '80vh' }}
          >
            {loading && <p className="text-gray-500 text-sm">Searching...</p>}
            {!loading && results.length === 0 && <p className="text-gray-500 text-sm">No results for "{query}"</p>}
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

      {/* Mobile search — full-screen overlay when active */}
      <div className="sm:hidden w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          placeholder="Search movies..."
          className="w-full pl-4 pr-4 py-2.5 rounded-lg text-white outline-none transition"
          style={{ background: '#2a2a2a', border: `1px solid ${active ? '#E50914' : '#444'}`, fontSize: 16 }}
        />
      </div>

      {/* Mobile full-screen results overlay */}
      {focused && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex flex-col"
          style={{ background: '#141414' }}
        >
          {/* Sticky search bar at top */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#181818', borderBottom: '1px solid #2a2a2a' }}>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search movies..."
              className="flex-1 px-4 py-2.5 rounded-lg text-white outline-none"
              style={{ background: '#2a2a2a', border: '1px solid #E50914', fontSize: 16 }}
            />
            <button onClick={close} className="text-gray-400 text-sm font-medium flex-shrink-0">Cancel</button>
          </div>

          {/* Results grid */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading && <p className="text-gray-500 text-sm">Searching...</p>}
            {!loading && query.length >= 2 && results.length === 0 && (
              <p className="text-gray-500 text-sm">No results for "{query}"</p>
            )}
            {query.length < 2 && (
              <p className="text-gray-600 text-sm">Type at least 2 characters to search</p>
            )}
            {results.length > 0 && (
              <>
                <p className="text-gray-500 text-sm mb-4">{results.length} results for "{query}"</p>
                <div className="grid grid-cols-3 gap-3">
                  {results.map((m) => <MovieCard key={m.id} movie={m} />)}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
