import { useState, useEffect } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useTMDB } from '../hooks/useTMDB.js'

const QUERY = gql`
  query GameMovies($limit: Int, $offset: Int) {
    movies(limit: $limit, offset: $offset) {
      totalCount
      movies { id title releaseYear popularity actors { name character } genres { name } }
    }
  }
`

const COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#1b1b2f', '#192a56', '#2c3e50']

// A single movie card shown as an answer option
function MovieOption({ movie, state, onClick }) {
  const tmdb = useTMDB(movie.title, movie.releaseYear)

  const border =
    state === 'correct' ? '3px solid #4ade80' :
    state === 'wrong'   ? '3px solid #f87171' :
    state === 'missed'  ? '3px solid #facc15' :
    state === 'selected'? '3px solid white'   : '3px solid transparent'

  const overlay =
    state === 'correct' ? 'rgba(74,222,128,0.25)' :
    state === 'wrong'   ? 'rgba(248,113,113,0.25)' :
    state === 'missed'  ? 'rgba(250,204,21,0.2)'   :
    state === 'selected'? 'rgba(255,255,255,0.1)'  : null

  const icon = state === 'correct' ? '✓' : state === 'wrong' ? '✗' : state === 'missed' ? '!' : null

  return (
    <div
      onClick={onClick}
      className="relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
      style={{ width: 160, height: 240, border, flexShrink: 0 }}
    >
      {tmdb?.poster
        ? <img src={tmdb.poster} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
        : <div className="w-full h-full" style={{ background: COLORS[movie.id % COLORS.length] }} />
      }
      {overlay && <div className="absolute inset-0" style={{ background: overlay }} />}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />

      {icon && (
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: state === 'correct' ? '#4ade80' : state === 'wrong' ? '#f87171' : '#facc15', color: '#000' }}>
          {icon}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
        <p className="text-white text-xs font-semibold line-clamp-2">{movie.title}</p>
        <p className="text-gray-400 text-xs">{movie.releaseYear}</p>
      </div>
    </div>
  )
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function GamePage() {
  const client = useApolloClient()
  const [movies, setMovies] = useState([])
  const [actorMap, setActorMap] = useState({})   // { actorName: [movie, ...] }
  const [actor, setActor] = useState(null)
  const [currentActorMovies, setCurrentActorMovies] = useState([])
  const [options, setOptions] = useState([])     // { movie, isCorrect }
  const [selected, setSelected] = useState(new Set())
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('actor_best') ?? 0))
  const [search, setSearch] = useState('')
  const [started, setStarted] = useState(false)
  const [error, setError] = useState(null)

  // Load movies and build an actor → movies map
  useEffect(() => {
    async function load() {
      // Fetch 3 pages of 1000 = 3000 movies, enough variety for the game
      const pages = await Promise.all(
        [0, 1, 2].map((i) =>
          client.query({ query: QUERY, variables: { limit: 1000, offset: i * 1000 } })
            .then((r) => r.data?.movies?.movies ?? [])
        )
      )

      const pool = pages.flat()
      setMovies(pool)

      const map = {}
      pool.forEach((m) => {
        m.actors?.forEach((a) => {
          if (!map[a.name]) map[a.name] = []
          map[a.name].push(m)
        })
      })
      setActorMap(map)
    }
    load().catch(() => setError('Could not load game data. Please try again.'))
  }, [client])

  // Actors that appear in at least 1 movie
  const eligible = Object.entries(actorMap).filter(([, ms]) => ms.length >= 1)

  // Search suggestions (shown after 2 characters)
  const suggestions = search.length >= 2
    ? eligible.filter(([name]) => name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : []

  // Build a round: pick correct movies for the actor + fill with wrong ones
  function buildRound(pickedActor, correctMovies) {
    const correct = shuffle(correctMovies).slice(0, Math.min(2, correctMovies.length))
    const wrong = shuffle(movies.filter((m) => !correctMovies.some((c) => c.id === m.id))).slice(0, 4 - correct.length)
    setActor(pickedActor)
    setOptions(shuffle([
      ...correct.map((m) => ({ movie: m, isCorrect: true })),
      ...wrong.map((m) => ({ movie: m, isCorrect: false })),
    ]))
    setSelected(new Set())
    setRevealed(false)
  }

  function startWithActor(name, correctMovies) {
    setCurrentActorMovies(correctMovies)
    buildRound(name, correctMovies)
    setStarted(true)
    setSearch('')
  }

  function startRandom() {
    if (eligible.length === 0) return
    const [name, correctMovies] = eligible[Math.floor(Math.random() * eligible.length)]
    setCurrentActorMovies(correctMovies)
    buildRound(name, correctMovies)
    setStarted(true)
  }

  function toggleSelect(id) {
    if (revealed) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function submit() {
    if (selected.size === 0 || revealed) return
    setRevealed(true)

    const correctIds = new Set(options.filter((o) => o.isCorrect).map((o) => o.movie.id))
    const allRight = [...selected].every((id) => correctIds.has(id)) &&
      [...correctIds].every((id) => selected.has(id))

    if (allRight) {
      const newScore = score + 1
      const newStreak = streak + 1
      setScore(newScore)
      setStreak(newStreak)
      if (newScore > best) { setBest(newScore); localStorage.setItem('actor_best', newScore) }
    } else {
      setStreak(0)
    }
  }

  function getState(option) {
    if (!revealed) return selected.has(option.movie.id) ? 'selected' : 'default'
    if (option.isCorrect && selected.has(option.movie.id)) return 'correct'
    if (!option.isCorrect && selected.has(option.movie.id)) return 'wrong'
    if (option.isCorrect) return 'missed'
    return 'default'
  }

  if (error) return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: '#141414' }}>
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  )

  if (movies.length === 0) return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: '#141414' }}>
      <p className="text-gray-500">Loading game...</p>
    </div>
  )

  // Actor picker screen
  if (!started) return (
    <div className="flex flex-col items-center justify-center gap-6 px-4" style={{ minHeight: '100vh', background: '#141414' }}>
      <h2 className="text-white text-3xl font-black">Actor Quiz</h2>
      <p className="text-gray-400 text-sm">Search for an actor or pick a random one</p>

      <div className="w-full max-w-sm relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actor..."
          className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
          style={{ background: '#2a2a2a', border: `1px solid ${search ? '#E50914' : '#444'}` }}
        />
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-10"
            style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            {suggestions.map(([name, ms]) => (
              <button key={name} onClick={() => startWithActor(name, ms)}
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition flex justify-between">
                <span>{name}</span>
                <span className="text-gray-500">{ms.length} movies</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={startRandom} className="px-8 py-3 rounded-xl font-semibold text-white transition hover:opacity-80" style={{ background: '#E50914' }}>
        Random Actor
      </button>
    </div>
  )

  const correctIds = new Set(options.filter((o) => o.isCorrect).map((o) => o.movie.id))
  const allRight = revealed && [...selected].every((id) => correctIds.has(id)) && [...correctIds].every((id) => selected.has(id))

  return (
    <div className="flex flex-col items-center gap-8 px-4 pb-16" style={{ minHeight: '100vh', background: '#141414', paddingTop: 100 }}>

      {/* Score / Streak / Best */}
      <div className="flex rounded-2xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
        {[{ label: 'Score', value: score, color: '#fff' }, { label: 'Streak', value: streak, color: '#fb923c' }, { label: 'Best', value: best, color: '#facc15' }]
          .map(({ label, value, color }, i) => (
            <div key={label} className="flex flex-col items-center px-10 py-4"
              style={{ background: '#181818', borderRight: i < 2 ? '1px solid #2a2a2a' : 'none' }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#555' }}>{label}</p>
              <p className="text-3xl font-black" style={{ color }}>{value}</p>
            </div>
          ))}
      </div>

      {/* Current actor */}
      <div className="text-center px-6 py-5 rounded-2xl" style={{ background: '#181818', border: '1px solid #333', minWidth: 280 }}>
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Which movies has this actor appeared in?</p>
        <p className="text-white text-3xl font-black">{actor}</p>
      </div>

      {/* Answer options */}
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((o) => (
          <MovieOption key={o.movie.id} movie={o.movie} state={getState(o)} onClick={() => toggleSelect(o.movie.id)} />
        ))}
      </div>

      {revealed && (
        <p className={`text-lg font-bold ${allRight ? 'text-green-400' : 'text-red-400'}`}>
          {allRight ? 'Correct!' : 'Wrong — yellow = movies you missed'}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-4">
        {!revealed ? (
          <button onClick={submit} disabled={selected.size === 0}
            className="px-8 py-3 rounded-lg font-semibold text-white transition hover:opacity-80 disabled:opacity-30"
            style={{ background: '#E50914' }}>Submit</button>
        ) : (
          <>
            <button onClick={() => buildRound(actor, currentActorMovies)}
              className="px-8 py-3 rounded-lg font-semibold text-white transition hover:opacity-80"
              style={{ background: '#E50914' }}>Next →</button>
            <button onClick={() => { setStarted(false); setSearch('') }}
              className="px-6 py-3 rounded-lg font-semibold text-sm text-gray-300 transition hover:text-white hover:bg-white/10"
              style={{ background: '#2a2a2a' }}>Change Actor</button>
          </>
        )}
      </div>
    </div>
  )
}
