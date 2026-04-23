import { useState } from 'react'
import { useTMDB } from '../hooks/useTMDB.js'
import { useFavoritesContext } from '../context/FavoritesContext.jsx'
import MovieModal from './MovieModal.jsx'

const COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#1b1b2f', '#192a56', '#2c3e50', '#1a0a2e', '#0d1b2a']

// A poster card that scales on hover, shows details and a save button, and opens the movie modal on click
export default function MovieCard({ movie }) {
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)
  const tmdb = useTMDB(movie.title, movie.releaseYear)
  const bg = COLORS[movie.id % COLORS.length]
  const { toggle, isSaved } = useFavoritesContext()
  const saved = isSaved(movie.id)

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex-shrink-0 rounded-md cursor-pointer transition-transform duration-200 overflow-hidden w-[120px] h-[180px] sm:w-[200px] sm:h-[300px]"
        style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)', zIndex: hovered ? 10 : 1 }}
      >
        {tmdb?.poster ? (
          <img src={tmdb.poster} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full" style={{ background: bg }} />
        )}

        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />

        {/* Heart — always visible when saved */}
        {saved && !hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); toggle(movie) }}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#E50914', fontSize: 15 }}
          >♥</button>
        )}

        {/* Title at bottom — hidden on hover */}
        {!hovered && (
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-sm font-semibold leading-tight line-clamp-1">{movie.title}</p>
          </div>
        )}

        {hovered && (
          <div className="absolute inset-0 p-3 flex flex-col justify-between"
            style={{ background: 'rgba(0,0,0,0.72)' }}>
            <div className="flex justify-between items-start gap-2">
              <p className="text-white text-sm font-semibold leading-tight line-clamp-2">{movie.title}</p>
              <button
                onClick={(e) => { e.stopPropagation(); toggle(movie) }}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition"
                style={{ background: 'rgba(0,0,0,0.6)', color: saved ? '#E50914' : 'white', fontSize: 15 }}
              >
                {saved ? '♥' : '♡'}
              </button>
            </div>
            <div>
              <p className="text-yellow-400 text-xs font-bold">★ {tmdb?.rating?.toFixed(1) ?? '—'}</p>
              <p className="text-gray-300 text-xs mt-0.5">{movie.releaseYear} · {movie.rating || 'NR'}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {movie.genres?.slice(0, 2).map((g) => (
                  <span key={g.name} className="text-xs text-gray-400">{g.name}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {open && <MovieModal movie={movie} onClose={() => setOpen(false)} />}
    </>
  )
}
