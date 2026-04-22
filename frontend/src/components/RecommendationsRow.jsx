import { useState, useEffect, useRef } from 'react'
import MovieCard from './MovieCard.jsx'
import { useTMDB } from '../hooks/useTMDB.js'
import { useFavoritesContext } from '../context/FavoritesContext.jsx'

const TOKEN = import.meta.env.VITE_TMDB_TOKEN
const similarCache = new Map()

function SimilarRow({ movie }) {
  const tmdb = useTMDB(movie.title, movie.releaseYear)
  const [similar, setSimilar] = useState([])
  const ref = useRef()

  useEffect(() => {
    if (!tmdb?.tmdbId) return
    const key = `similar-${tmdb.tmdbId}`
    if (similarCache.has(key)) {
      setSimilar(similarCache.get(key))
      return
    }
    fetch(`https://api.themoviedb.org/3/movie/${tmdb.tmdbId}/similar`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const cjk = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/
        const results = (data.results ?? [])
          .filter((m) => !cjk.test(m.title))
          .slice(0, 20)
          .map((m) => ({
            id: m.id,
            title: m.title,
            releaseYear: m.release_date?.slice(0, 4) ?? null,
            rating: null,
            voteAverage: m.vote_average,
            popularity: m.popularity,
            genres: [],
            actors: [],
          }))
        similarCache.set(key, results)
        setSimilar(results)
      })
      .catch(() => {})
  }, [tmdb?.tmdbId])

  if (similar.length === 0) return null

  return (
    <div className="mb-10">
      <h2 className="text-white font-semibold text-lg mb-3">
        Because you liked{' '}
        <span style={{ color: '#E50914' }}>{movie.title}</span>
      </h2>
      <div className="relative group">
        <button
          onClick={() => ref.current.scrollBy({ left: -600, behavior: 'smooth' })}
          className="absolute left-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-r from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl"
        >‹</button>
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-8" style={{ scrollbarWidth: 'none' }}>
          {similar.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
        <button
          onClick={() => ref.current.scrollBy({ left: 600, behavior: 'smooth' })}
          className="absolute right-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-l from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl"
        >›</button>
      </div>
    </div>
  )
}

export default function RecommendationsRow() {
  const { favorites } = useFavoritesContext()
  if (favorites.length === 0) return null
  return (
    <>
      {favorites.slice(0, 3).map((movie) => (
        <SimilarRow key={movie.id} movie={movie} />
      ))}
    </>
  )
}
