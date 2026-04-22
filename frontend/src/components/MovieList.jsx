import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import MovieCard from './MovieCard.jsx'
import PopularRow from './PopularRow.jsx'
import RecommendationsRow from './RecommendationsRow.jsx'
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

function MovieRow({ title, movies, onRemove }) {
  const ref = useRef()
  return (
    <div className="mb-10">
      <h2 className="text-white font-semibold text-lg mb-3">{title}</h2>
      <div className="relative group">
        <button
          onClick={() => ref.current.scrollBy({ left: -600, behavior: 'smooth' })}
          className="absolute left-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-r from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl"
        >‹</button>
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-8" style={{ scrollbarWidth: 'none' }}>
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} onRemove={onRemove} />
          ))}
        </div>
        <button
          onClick={() => ref.current.scrollBy({ left: 600, behavior: 'smooth' })}
          className="absolute right-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-l from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl"
        >›</button>
      </div>
    </div>
  )
}

const PAGE_SIZE = 500
const HIDDEN_GENRES = new Set(['Romance'])

function GenreRows({ baseOffset, filters }) {
  const client = useApolloClient()
  const [genreMap, setGenreMap] = useState({})
  const { favorites } = useFavoritesContext()

  useEffect(() => {
    setGenreMap({})
    async function load() {
      const pages = await Promise.all(
        Array.from({ length: 2 }, (_, i) =>
          client.query({ query: MOVIES_QUERY, variables: { limit: 100, offset: baseOffset + i * 100 } }).catch(() => null)
        )
      )
      const cjk = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/
      const all = pages
        .flatMap((r) => r?.data?.movies?.movies ?? [])
        .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
        .filter((m) => !cjk.test(m.title))
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))

      const map = {}
      all.forEach((m) => {
        m.genres.forEach((g) => {
          if (!map[g.name]) map[g.name] = []
          map[g.name].push(m)
        })
      })
      setGenreMap(map)
    }
    load()
  }, [client, baseOffset])

  const minRating = filters.minRating ? parseFloat(filters.minRating) : 0
  const minYear = filters.minYear ? parseInt(filters.minYear, 10) : 0
  const maxYear = filters.maxYear ? parseInt(filters.maxYear, 10) : 9999

  function applyFilters(movies) {
    return movies.filter((m) => {
      if (minRating > 0 && (m.voteAverage ?? 0) < minRating) return false
      const y = parseInt(m.releaseYear, 10)
      if (filters.minYear && y < minYear) return false
      if (filters.maxYear && y > maxYear) return false
      return true
    })
  }

  const rows = Object.entries(genreMap)
    .filter(([genre]) => !HIDDEN_GENRES.has(genre))
    .filter(([genre]) => !filters.genre || genre === filters.genre)
    .map(([genre, ms]) => [genre, applyFilters(ms)])
    .filter(([, ms]) => ms.length >= 4)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, filters.genre ? 1 : 10)

  if (Object.keys(genreMap).length === 0) return (
    <div className="space-y-10">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-4 w-32 rounded mb-3 animate-pulse bg-gray-800" />
          <div className="flex gap-3">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="rounded flex-shrink-0 animate-pulse bg-gray-800" style={{ width: 200, height: 300 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const filteredFavorites = applyFilters(favorites)

  return (
    <>
      {filteredFavorites.length > 0 && !filters.genre && (
        <MovieRow title="My List" movies={filteredFavorites} />
      )}
      {rows.map(([genre, ms]) => <MovieRow key={genre} title={genre} movies={ms} />)}
      {rows.length === 0 && (
        <p className="text-gray-500 text-sm py-8">No movies match your filters.</p>
      )}
    </>
  )
}

function FilterBar({ filters, onChange }) {
  const ref = useRef()
  const hasFilters = filters.genre || filters.minYear || filters.maxYear || filters.minRating

  const pillBase = 'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer select-none'

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    outline: 'none',
    width: 52,
    fontSize: 13,
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {/* All pill */}
        <button
          onClick={() => onChange({ ...filters, genre: '' })}
          className={pillBase}
          style={{
            background: !filters.genre ? '#E50914' : '#2a2a2a',
            color: !filters.genre ? 'white' : '#aaa',
          }}
        >
          All
        </button>

        {/* Genre pills */}
        {ALL_GENRES.map((g) => (
          <button
            key={g}
            onClick={() => onChange({ ...filters, genre: filters.genre === g ? '' : g })}
            className={pillBase}
            style={{
              background: filters.genre === g ? '#E50914' : '#2a2a2a',
              color: filters.genre === g ? 'white' : '#aaa',
            }}
          >
            {g}
          </button>
        ))}

        {/* Divider */}
        <div className="flex-shrink-0 w-px h-5 mx-1" style={{ background: '#333' }} />

        {/* Year range pill */}
        <div
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm cursor-text"
          style={{ background: (filters.minYear || filters.maxYear) ? '#1a1a1a' : '#2a2a2a', border: `1px solid ${(filters.minYear || filters.maxYear) ? '#E50914' : '#444'}` }}
        >
          <input
            type="number"
            value={filters.minYear}
            onChange={(e) => onChange({ ...filters, minYear: e.target.value })}
            placeholder="From"
            min="1900" max="2025"
            style={{ ...inputStyle, width: 40 }}
          />
          <span style={{ color: '#555' }}>–</span>
          <input
            type="number"
            value={filters.maxYear}
            onChange={(e) => onChange({ ...filters, maxYear: e.target.value })}
            placeholder="To"
            min="1900" max="2025"
            style={{ ...inputStyle, width: 32 }}
          />
        </div>

        {/* Rating pill */}
        <div
          className="flex-shrink-0 flex items-center rounded-full overflow-hidden"
          style={{ background: '#2a2a2a', border: `1px solid ${filters.minRating ? '#E50914' : '#444'}` }}
        >
          {['', '5', '6', '7', '8'].map((v) => (
            <button
              key={v}
              onClick={() => onChange({ ...filters, minRating: v })}
              className="px-3 py-1.5 text-sm transition"
              style={{
                background: filters.minRating === v ? '#E50914' : 'transparent',
                color: filters.minRating === v ? 'white' : '#aaa',
              }}
            >
              {v === '' ? '★ All' : `${v}+`}
            </button>
          ))}
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => onChange({ genre: '', minYear: '', maxYear: '', minRating: '' })}
            className={`${pillBase} flex-shrink-0`}
            style={{ background: '#1e1e1e', color: '#777', border: '1px solid #333' }}
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  )
}

export default function MovieList() {
  const [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState({ genre: '', minYear: '', maxYear: '', minRating: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const { data } = useQuery(MOVIES_QUERY, { variables: { limit: 1, offset } })
  const { customMovies, addMovie, removeMovie } = useCustomMovies()

  const totalCount = data?.movies?.totalCount ?? 0
  const hasNextPage = data?.movies?.hasNextPage ?? false

  return (
    <div>
      <PopularRow />
      <RecommendationsRow />

      {customMovies.length > 0 && (
        <MovieRow title="My Movies" movies={customMovies} onRemove={removeMovie} />
      )}

      <FilterBar filters={filters} onChange={setFilters} />
      <GenreRows baseOffset={offset} filters={filters} />

      <div className="flex justify-center items-center gap-6 py-6 mt-4">
        <button
          onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
          disabled={offset === 0}
          className="px-5 py-2 rounded text-sm font-medium disabled:opacity-30 transition"
          style={{ background: '#E50914' }}
        >← Previous</button>
        {totalCount > 0 && (
          <span className="text-gray-500 text-sm">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()} movies
          </span>
        )}
        <button
          onClick={() => setOffset((o) => o + PAGE_SIZE)}
          disabled={!hasNextPage}
          className="px-5 py-2 rounded text-sm font-medium disabled:opacity-30 transition"
          style={{ background: '#E50914' }}
        >Next →</button>
      </div>

      {/* Floating Add button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition hover:scale-110 z-30"
        style={{ background: '#E50914' }}
        title="Add a movie"
      >+</button>

      {showAddModal && (
        <AddMovieModal
          onClose={() => setShowAddModal(false)}
          onAdd={addMovie}
        />
      )}
    </div>
  )
}
