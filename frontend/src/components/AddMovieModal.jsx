import { useEffect, useState } from 'react'

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'Western',
]

// Modal form that lets the user add a custom movie with title, year, rating, and genres
export default function AddMovieModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [genres, setGenres] = useState([])
  const [rating, setRating] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Add a genre to the selection, or remove it if already selected
  function toggleGenre(g) {
    setGenres((gs) => gs.includes(g) ? gs.filter((x) => x !== g) : [...gs, g])
  }

  // Validate the form, build a movie object, and pass it to the parent
  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    onAdd({
      title: title.trim(),
      releaseYear: year || null,
      genres: genres.map((name) => ({ name })),
      rating: null,
      voteAverage: rating ? parseFloat(rating) : null,
      popularity: 0,
      actors: [],
    })
    onClose()
  }

  const inputCls = 'w-full px-3 py-2 rounded text-white text-sm outline-none focus:ring-1'
  const inputStyle = { background: '#2a2a2a', border: '1px solid #444', '--tw-ring-color': '#E50914', fontSize: 16 }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-xl w-full max-w-md"
        style={{ background: '#181818', border: '1px solid #2a2a2a' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-2">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition"
            style={{ background: '#2a2a2a' }}
          >✕</button>
          <h2 className="text-white text-xl font-bold">Add a movie</h2>
          <p className="text-gray-500 text-sm mt-1">It will appear in My Movies on the home page</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wide mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              placeholder="e.g. The Dark Knight"
              className={inputCls}
              style={inputStyle}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* Year + Rating side by side */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-xs uppercase tracking-wide mb-1.5">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2008"
                min="1900"
                max="2099"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-400 text-xs uppercase tracking-wide mb-1.5">Rating (0–10)</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="8.5"
                min="0"
                max="10"
                step="0.1"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition"
                  style={{
                    background: genres.includes(g) ? '#E50914' : '#2a2a2a',
                    color: genres.includes(g) ? 'white' : '#aaa',
                    border: `1px solid ${genres.includes(g) ? '#E50914' : '#444'}`,
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded font-semibold text-sm text-white transition hover:opacity-90 mt-2"
            style={{ background: '#E50914' }}
          >
            Add Movie
          </button>
        </form>
      </div>
    </div>
  )
}
