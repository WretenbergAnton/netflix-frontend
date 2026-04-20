import { useState } from 'react'

const COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#1b1b2f', '#192a56', '#2c3e50', '#1a0a2e', '#0d1b2a']

export default function MovieCard({ movie }) {
  const [hovered, setHovered] = useState(false)
  const bg = COLORS[movie.id % COLORS.length]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-shrink-0 rounded-md overflow-visible cursor-pointer transition-transform duration-200"
      style={{ width: 180, transform: hovered ? 'scale(1.08)' : 'scale(1)', zIndex: hovered ? 10 : 1 }}
    >
      {/* Thumbnail */}
      <div className="rounded-md overflow-hidden" style={{ height: 100, background: bg }}>
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{movie.title}</p>
        </div>
      </div>

      {/* Hover card */}
      {hovered && (
        <div className="absolute left-0 right-0 top-full rounded-b-md p-3 shadow-2xl z-20"
          style={{ background: '#1f1f1f', border: '1px solid #333', borderTop: 'none' }}>
          <p className="text-yellow-400 text-xs font-bold mb-1">★ {movie.voteAverage?.toFixed(1) ?? '—'}</p>
          <p className="text-gray-400 text-xs">{movie.releaseYear} · {movie.rating || 'NR'}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {movie.genres?.slice(0, 2).map((g) => (
              <span key={g.name} className="text-xs text-gray-500">{g.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
