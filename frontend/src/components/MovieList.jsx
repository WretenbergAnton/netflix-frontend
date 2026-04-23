import { useState, useRef, useEffect } from 'react'
import { useQuery, useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import MovieCard from './MovieCard.jsx'
import PopularRow from './PopularRow.jsx'
import AddMovieModal from './AddMovieModal.jsx'
import { useFavoritesContext } from '../context/FavoritesContext.jsx'
import { useCustomMovies } from '../context/CustomMoviesContext.jsx'

const MOVIES_QUERY = gql`
  query Movies($limit: Int, $offset: Int) {
    movies(limit: $limit, offset: $offset) {
      totalCount
      hasNextPage
      movies {
        id title releaseYear rating voteAverage popularity
        genres { name }
        actors { name character }
      }
    }
  }
`

const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Music',
  'Mystery', 'Science Fiction', 'Thriller', 'Western',
]

const PAGE_SIZE = 500

// A horizontally scrollable row of movie cards
function MovieRow({ title, movies, onRemove }) {
  const ref = useRef()
  return (
    <div className="mb-10">
      <h2 className="text-white font-semibold text-lg mb-3">{title}</h2>
      <div className="relative group">
        <button onClick={() => ref.current.scrollBy({ left: -600, behavior: 'smooth' })}
          className="absolute left-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-r from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl">‹</button>
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-8" style={{ scrollbarWidth: 'none' }}>
          {movies.map((m) => <MovieCard key={m.id} movie={m} onRemove={onRemove} />)}
        </div>
        <button onClick={() => ref.current.scrollBy({ left: 600, behavior: 'smooth' })}
          className="absolute right-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-l from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl">›</button>
      </div>
    </div>
  )
}

// Takes a list of movies and groups them into { genre: [movies] }
function groupByGenre(movies) {
  const map = {}
  movies.forEach((m) => {
    m.genres.forEach((g) => {
      if (!map[g.name]) map[g.name] = []
      map[g.name].push(m)
    })
  })
  return map
}

// Fetches movies and groups them by genre
function GenreRows({ baseOffset, filters }) {
  const client = useApolloClient()
  const [genreMap, setGenreMap] = useState({})
  const [error, setError] = useState(null)
  const { favorites } = useFavoritesContext()

  useEffect(() => {
    setGenreMap({})
    setError(null)
    async function load() {
      // Fetch 2 pages of 100 movies
      const pages = await Promise.all(
        [0, 1].map((i) =>
          client.query({ query: MOVIES_QUERY, variables: { limit: 100, offset: baseOffset + i * 100 } }).catch(() => null)
        )
      )

      // Merge both pages into one list, remove duplicates and Asian-title movies
      const cjk = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/
      const seen = new Set()
      const movies = pages
        .flatMap((r) => r?.data?.movies?.movies ?? [])
        .filter((m) => !seen.has(m.id) && seen.add(m.id))
        .filter((m) => !cjk.test(m.title))
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))

      setGenreMap(groupByGenre(movies))
    }
    load().catch(() => setError('Could not load movies. Please try again.'))
  }, [client, baseOffset])

  if (error) return <p className="text-red-400 text-sm py-8">{error}</p>

  // Apply year and rating filters to a list of movies
  function applyFilters(movies) {
    return movies.filter((m) => {
      if (filters.minRating && (m.voteAverage ?? 0) < parseFloat(filters.minRating)) return false
      if (filters.minYear && parseInt(m.releaseYear) < parseInt(filters.minYear)) return false
      if (filters.maxYear && parseInt(m.releaseYear) > parseInt(filters.maxYear)) return false
      return true
    })
  }

  // Build the list of genre rows to show
  const rows = Object.entries(genreMap)
    .filter(([genre]) => genre !== 'Romance')
    .filter(([genre]) => !filters.genre || genre === filters.genre)
    .map(([genre, ms]) => [genre, applyFilters(ms)])
    .filter(([, ms]) => ms.length >= 4)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, filters.genre ? 1 : 10)

  // Show skeleton loading cards while data loads
  if (Object.keys(genreMap).length === 0) return (
    <div className="space-y-10">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-4 w-32 rounded mb-3 animate-pulse bg-gray-800" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="rounded flex-shrink-0 animate-pulse bg-gray-800" style={{ width: 200, height: 300 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Show My List row if user has favorites and no genre filter is active */}
      {applyFilters(favorites).length > 0 && !filters.genre && (
        <MovieRow title="My List" movies={applyFilters(favorites)} />
      )}
      {rows.map(([genre, ms]) => <MovieRow key={genre} title={genre} movies={ms} />)}
      {rows.length === 0 && <p className="text-gray-500 text-sm py-8">No movies match your filters.</p>}
    </>
  )
}

// Horizontal scrollable filter bar with genre pills + year/rating
function FilterBar({ filters, onChange }) {
  const active = (v) => ({ background: v ? '#E50914' : '#2a2a2a', color: v ? 'white' : '#aaa' })
  const pill = 'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer'
  const hasFilters = filters.genre || filters.minYear || filters.maxYear || filters.minRating

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>

        {/* Genre pills */}
        <button className={pill} style={active(!filters.genre)} onClick={() => onChange({ ...filters, genre: '' })}>All</button>
        {ALL_GENRES.map((g) => (
          <button key={g} className={pill} style={active(filters.genre === g)}
            onClick={() => onChange({ ...filters, genre: filters.genre === g ? '' : g })}>
            {g}
          </button>
        ))}

        <div className="flex-shrink-0 w-px h-5 mx-1" style={{ background: '#333' }} />

        {/* Year range */}
        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full"
          style={{ background: '#2a2a2a', border: `1px solid ${filters.minYear || filters.maxYear ? '#E50914' : '#444'}` }}>
          <input type="number" value={filters.minYear} placeholder="From" min="1900" max="2025"
            onChange={(e) => onChange({ ...filters, minYear: e.target.value })}
            style={{ background: 'transparent', border: 'none', color: '#ccc', outline: 'none', width: 40, fontSize: 16 }} />
          <span style={{ color: '#555' }}>–</span>
          <input type="number" value={filters.maxYear} placeholder="To" min="1900" max="2025"
            onChange={(e) => onChange({ ...filters, maxYear: e.target.value })}
            style={{ background: 'transparent', border: 'none', color: '#ccc', outline: 'none', width: 32, fontSize: 16 }} />
        </div>

        {/* Min rating */}
        <div className="flex-shrink-0 flex items-center rounded-full overflow-hidden"
          style={{ background: '#2a2a2a', border: `1px solid ${filters.minRating ? '#E50914' : '#444'}` }}>
          {['', '5', '6', '7', '8'].map((v) => (
            <button key={v} onClick={() => onChange({ ...filters, minRating: v })}
              className="px-3 py-1.5 text-sm transition"
              style={{ background: filters.minRating === v ? '#E50914' : 'transparent', color: filters.minRating === v ? 'white' : '#aaa' }}>
              {v === '' ? '★ All' : `${v}+`}
            </button>
          ))}
        </div>

        {/* Clear all filters */}
        {hasFilters && (
          <button className={pill} onClick={() => onChange({ genre: '', minYear: '', maxYear: '', minRating: '' })}
            style={{ background: '#1e1e1e', color: '#777', border: '1px solid #333' }}>
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  )
}

export default function MovieList({ initialGenre = '', onGenreUsed }) {
  const [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState({ genre: initialGenre, minYear: '', maxYear: '', minRating: '' })

  // When a genre is passed in from the charts page, apply it once then clear it
  useEffect(() => {
    if (initialGenre) {
      setFilters((f) => ({ ...f, genre: initialGenre }))
      onGenreUsed?.()
    }
  }, [initialGenre, onGenreUsed])
  const [showAddModal, setShowAddModal] = useState(false)
  const { data } = useQuery(MOVIES_QUERY, { variables: { limit: 1, offset } })
  const { customMovies, addMovie, removeMovie } = useCustomMovies()

  const totalCount = data?.movies?.totalCount ?? 0
  const hasNextPage = data?.movies?.hasNextPage ?? false

  return (
    <div>
      {!filters.genre && <PopularRow />}
      {customMovies.length > 0 && !filters.genre && (
        <MovieRow title="My Movies" movies={customMovies} onRemove={removeMovie} />
      )}

      <FilterBar filters={filters} onChange={setFilters} />
      <GenreRows baseOffset={offset} filters={filters} />

      {/* Pagination */}
      <div className="flex justify-center items-center gap-6 py-6 mt-4">
        <button onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))} disabled={offset === 0}
          className="px-5 py-2 rounded text-sm font-medium disabled:opacity-30 transition" style={{ background: '#E50914' }}>
          ← Previous
        </button>
        {totalCount > 0 && (
          <span className="text-gray-500 text-sm">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()} movies
          </span>
        )}
        <button onClick={() => setOffset((o) => o + PAGE_SIZE)} disabled={!hasNextPage}
          className="px-5 py-2 rounded text-sm font-medium disabled:opacity-30 transition" style={{ background: '#E50914' }}>
          Next →
        </button>
      </div>

      {/* Floating button to add a custom movie */}
      <button onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition hover:scale-110 z-30"
        style={{ background: '#E50914' }}>+</button>

      {showAddModal && <AddMovieModal onClose={() => setShowAddModal(false)} onAdd={addMovie} />}
    </div>
  )
}
