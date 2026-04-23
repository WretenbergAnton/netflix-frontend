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
  const [query, setQuery] = useState('')       // what the user has typed
  const [open, setOpen] = useState(false)      // whether the dropdown is visible
  const [focused, setFocused] = useState(false) // whether the input is focused
  const ref = useRef()                          // reference to the whole component

  // useLazyQuery lets us run the search manually (not automatically on load)
  const [search, { data, loading }] = useLazyQuery(SEARCH_QUERY)

  // Close the dropdown when the user clicks outside the search bar
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

  const results = data?.searchMovies ?? []

  return (
    <div ref={ref} className="w-full max-w-md relative">
      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => { setFocused(true); if (query.length >= 2) setOpen(true) }}
        onBlur={() => setFocused(false)}
        placeholder="Search movies..."
        className="w-full pl-4 pr-4 py-2 rounded-lg text-white text-sm outline-none transition w-full"
        style={{ background: '#2a2a2a', border: `1px solid ${focused || query.length > 0 ? '#E50914' : '#444'}`, fontSize: 16 }}
      />

      {/* Dropdown with search results */}
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
