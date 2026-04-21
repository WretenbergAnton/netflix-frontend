import { useState, useEffect, useRef } from 'react'
import MovieModal from './MovieModal.jsx'

const TOKEN = import.meta.env.VITE_TMDB_TOKEN

function TrendingCard({ movie, onClick }) {
  const [hovered, setHovered] = useState(false)
  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : null

  return (
    <div
      onClick={() => onClick(movie)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-transform duration-200"
      style={{ width: 200, height: 300, transform: hovered ? 'scale(1.05)' : 'scale(1)', zIndex: hovered ? 10 : 1 }}
    >
      {poster
        ? <img src={poster} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
        : <div className="w-full h-full bg-gray-800" />
      }
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
      {!hovered && (
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-semibold line-clamp-1">{movie.title}</p>
        </div>
      )}
      {hovered && (
        <div className="absolute inset-0 p-3 flex flex-col justify-between" style={{ background: 'rgba(0,0,0,0.72)' }}>
          <p className="text-white text-sm font-semibold line-clamp-2">{movie.title}</p>
          <div>
            <p className="text-yellow-400 text-xs font-bold">★ {movie.vote_average?.toFixed(1)}</p>
            <p className="text-gray-300 text-xs mt-0.5">{movie.release_date?.slice(0, 4)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function TrendingRow({ title, movies, onCardClick }) {
  const ref = useRef()
  return (
    <div className="mb-10">
      <h2 className="text-white font-semibold text-lg mb-3">{title}</h2>
      <div className="relative group">
        <button onClick={() => ref.current.scrollBy({ left: -600, behavior: 'smooth' })}
          className="absolute left-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-r from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl">‹</button>
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {movies.map((m) => <TrendingCard key={m.id} movie={m} onClick={onCardClick} />)}
        </div>
        <button onClick={() => ref.current.scrollBy({ left: 600, behavior: 'smooth' })}
          className="absolute right-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-l from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl">›</button>
      </div>
    </div>
  )
}

function toModalMovie(m) {
  return {
    id: m.id,
    title: m.title,
    releaseYear: m.release_date?.slice(0, 4),
    rating: null,
    genres: m.genre_ids?.map((id) => ({ name: id })) ?? [],
    actors: [],
  }
}

export default function TrendingPage() {
  const [weekly, setWeekly] = useState([])
  const [daily, setDaily] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const headers = { Authorization: `Bearer ${TOKEN}` }

    Promise.all([
      fetch('https://api.themoviedb.org/3/trending/movie/week', { headers }).then((r) => r.json()),
      fetch('https://api.themoviedb.org/3/trending/movie/day', { headers }).then((r) => r.json()),
      fetch('https://api.themoviedb.org/3/movie/upcoming', { headers }).then((r) => r.json()),
      fetch('https://api.themoviedb.org/3/movie/now_playing', { headers }).then((r) => r.json()),
    ]).then(([week, day, upcom, now]) => {
      setWeekly(week.results ?? [])
      setDaily(day.results ?? [])
      setUpcoming(upcom.results ?? [])
      setNowPlaying(now.results ?? [])
    })
  }, [])

  return (
    <div className="px-12 pb-12 pt-28">
      <h2 className="text-white text-2xl font-bold mb-8">Trending & New</h2>

      {daily.length > 0 && <TrendingRow title="Trending Today" movies={daily} onCardClick={(m) => setSelected(toModalMovie(m))} />}
      {weekly.length > 0 && <TrendingRow title="Trending This Week" movies={weekly} onCardClick={(m) => setSelected(toModalMovie(m))} />}
      {nowPlaying.length > 0 && <TrendingRow title="Now Playing in Cinemas" movies={nowPlaying} onCardClick={(m) => setSelected(toModalMovie(m))} />}
      {upcoming.length > 0 && <TrendingRow title="Coming Soon" movies={upcoming} onCardClick={(m) => setSelected(toModalMovie(m))} />}

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
