import { useState } from 'react'
import { useTMDB } from '../hooks/useTMDB.js'
import MovieModal from './MovieModal.jsx'

const FEATURED = [
  { title: 'Inception', releaseYear: 2010 },
  { title: 'Interstellar', releaseYear: 2014 },
  { title: 'The Dark Knight', releaseYear: 2008 },
  { title: 'Avengers: Endgame', releaseYear: 2019 },
  { title: 'Gladiator', releaseYear: 2000 },
]

const PICK = FEATURED[Math.floor(Math.random() * FEATURED.length)]

function HeroContent({ movie, onInfo }) {
  const tmdb = useTMDB(movie.title, movie.releaseYear)

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 520 }}
    >
      {/* Backdrop */}
      {tmdb?.backdrop ? (
        <img src={tmdb.backdrop} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: '#0a0a0a' }} />
      )}

      {/* Gradients */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 40%, transparent 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #141414 0%, transparent 40%)' }} />

      {/* Text content */}
      <div className="absolute bottom-16 left-12 max-w-lg">
        <h2 className="text-5xl font-black text-white mb-3 leading-tight">{movie.title}</h2>
        <div className="flex items-center gap-3 mb-4">
          {tmdb?.rating && (
            <span className="text-green-400 font-bold text-sm">{Math.round(tmdb.rating * 10)}% Match</span>
          )}
          <span className="text-gray-300 text-sm">{movie.releaseYear}</span>
        </div>
        {tmdb?.overview && (
          <p className="text-gray-200 text-sm leading-relaxed line-clamp-3 mb-6">{tmdb.overview}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => onInfo({ ...movie, genres: [] })}
            className="flex items-center gap-2 px-6 py-2.5 rounded font-semibold text-sm transition hover:opacity-80"
            style={{ background: '#E50914', color: 'white' }}
          >
            ▶ Play
          </button>
          <button
            onClick={() => onInfo({ ...movie, genres: [] })}
            className="flex items-center gap-2 px-6 py-2.5 rounded font-semibold text-sm transition hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            ⓘ More Info
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HeroBanner() {
  const [modalMovie, setModalMovie] = useState(null)

  return (
    <>
      <HeroContent movie={PICK} onInfo={setModalMovie} />
      {modalMovie && <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />}
    </>
  )
}
