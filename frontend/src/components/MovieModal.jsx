import { useEffect } from 'react'
import { useTMDB } from '../hooks/useTMDB.js'
import { useFavoritesContext } from '../context/FavoritesContext.jsx'

export default function MovieModal({ movie, onClose }) {
  const tmdb = useTMDB(movie.title, movie.releaseYear)
  const { toggle, isSaved } = useFavoritesContext()
  const saved = isSaved(movie.id)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-lg overflow-hidden w-full max-w-2xl"
        style={{ background: '#181818' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop or poster */}
        <div className="relative" style={{ height: 320 }}>
          {tmdb?.backdrop || tmdb?.poster ? (
            <img
              src={tmdb.backdrop ?? tmdb.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-800" />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #181818 0%, transparent 60%)' }} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/80 transition"
          >✕</button>
        </div>

        {/* Info */}
        <div className="px-8 pb-8 -mt-10 relative">
          <h2 className="text-white text-2xl font-bold mb-2">{movie.title}</h2>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-yellow-400 font-semibold">★ {tmdb?.rating?.toFixed(1) ?? '—'}</span>
            {tmdb?.voteCount && (
              <span className="text-gray-400 text-sm">{tmdb.voteCount.toLocaleString()} votes</span>
            )}
            <span className="text-gray-400 text-sm">{movie.releaseYear}</span>
            {movie.rating && movie.rating !== 'NR' && (
              <span className="text-gray-400 text-xs border border-gray-600 px-1.5 py-0.5 rounded">{movie.rating}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres?.map((g) => (
              <span key={g.name} className="text-xs px-2 py-1 rounded-full text-gray-300" style={{ background: '#2a2a2a' }}>
                {g.name}
              </span>
            ))}
          </div>

          {tmdb?.overview && (
            <p className="text-gray-300 text-sm leading-relaxed mb-6">{tmdb.overview}</p>
          )}

          <div className="flex gap-3">
            <a
              href={`https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+${movie.releaseYear ?? ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm transition hover:opacity-80"
              style={{ background: '#E50914', color: 'white' }}
            >
              ▶ Watch
            </a>
            <button
              onClick={() => toggle(movie)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm transition hover:opacity-80"
              style={{ background: saved ? '#E50914' : '#2a2a2a', color: 'white' }}
            >
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
