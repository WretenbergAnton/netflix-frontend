import { useState, useEffect, useRef } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useTMDB } from '../hooks/useTMDB.js'

const QUERY = gql`
  query {
    movies(limit: 500, offset: 0) {
      movies { id title releaseYear popularity genres { name } }
    }
  }
`

function MoviePoster({ movie, hideYear }) {
  const tmdb = useTMDB(movie.title, movie.releaseYear)
  const COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#1b1b2f', '#192a56', '#2c3e50']
  const bg = COLORS[movie.id % COLORS.length]

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ width: 200, height: 300 }}>
      {tmdb?.poster
        ? <img src={tmdb.poster} alt={movie.title} className="w-full h-full object-cover" />
        : <div className="w-full h-full" style={{ background: bg }} />
      }
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
        <p className="text-white text-sm font-bold leading-tight">{movie.title}</p>
        {!hideYear && <p className="text-yellow-400 text-sm font-bold mt-1">{movie.releaseYear}</p>}
        {hideYear && <p className="text-gray-400 text-xs mt-1">What year?</p>}
      </div>
    </div>
  )
}

function SwipeCard({ movie, onSwipe, result }) {
  const cardRef = useRef()
  const startX = useRef(null)
  const [offsetX, setOffsetX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const tmdb = useTMDB(movie.title, movie.releaseYear)
  const COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#1b1b2f', '#192a56', '#2c3e50']
  const bg = COLORS[movie.id % COLORS.length]

  function onDown(clientX) {
    if (result) return
    startX.current = clientX
    setDragging(true)
  }

  function onMove(clientX) {
    if (!dragging || startX.current === null) return
    setOffsetX(clientX - startX.current)
  }

  function onUp() {
    if (!dragging) return
    setDragging(false)
    if (offsetX > 80) onSwipe('after')
    else if (offsetX < -80) onSwipe('before')
    else setOffsetX(0)
    startX.current = null
  }

  // Animate out on result
  useEffect(() => {
    if (result === 'correct') setOffsetX(result === 'correct' ? 0 : 0)
  }, [result])

  const rotation = offsetX / 20
  const afterOpacity = Math.max(0, Math.min(1, offsetX / 80))
  const beforeOpacity = Math.max(0, Math.min(1, -offsetX / 80))

  return (
    <div
      ref={cardRef}
      className="relative rounded-xl overflow-hidden select-none"
      style={{
        width: 200, height: 300,
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
        transition: dragging ? 'none' : 'transform 0.3s ease',
        cursor: result ? 'default' : 'grab',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      onMouseDown={(e) => onDown(e.clientX)}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => onDown(e.touches[0].clientX)}
      onTouchMove={(e) => { e.preventDefault(); onMove(e.touches[0].clientX) }}
      onTouchEnd={onUp}
    >
      {tmdb?.poster
        ? <img src={tmdb.poster} alt={movie.title} className="w-full h-full object-cover pointer-events-none" />
        : <div className="w-full h-full" style={{ background: bg }} />
      }
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />

      {/* AFTER label */}
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full font-black text-sm border-2 border-green-400 text-green-400"
        style={{ opacity: afterOpacity, transform: `rotate(${-rotation}deg)` }}>
        AFTER
      </div>

      {/* BEFORE label */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full font-black text-sm border-2 border-red-400 text-red-400"
        style={{ opacity: beforeOpacity, transform: `rotate(${-rotation}deg)` }}>
        BEFORE
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
        <p className="text-white text-sm font-bold leading-tight">{movie.title}</p>
        {result
          ? <p className="text-yellow-400 text-sm font-bold mt-1">{movie.releaseYear}</p>
          : <p className="text-gray-400 text-xs mt-1">Drag to guess →</p>
        }
      </div>

      {/* Result overlay */}
      {result && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: result === 'correct' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }}>
          <span className="text-5xl">{result === 'correct' ? '✓' : '✗'}</span>
        </div>
      )}
    </div>
  )
}

export default function GamePage() {
  const client = useApolloClient()
  const [pool, setPool] = useState([])
  const [refMovie, setRefMovie] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('game_best') ?? 0))
  const [gameOver, setGameOver] = useState(false)
  const usedIds = useRef(new Set())

  useEffect(() => {
    client.query({ query: QUERY }).then((r) => {
      const movies = (r.data?.movies?.movies ?? []).filter((m) => m.releaseYear)
      setPool(movies)
    })
  }, [client])

  useEffect(() => {
    if (pool.length >= 2) startGame()
  }, [pool])

  function pick(exclude = []) {
    const available = pool.filter((m) => !usedIds.current.has(m.id) && !exclude.includes(m.id))
    if (available.length === 0) { usedIds.current.clear(); return pool[Math.floor(Math.random() * pool.length)] }
    return available[Math.floor(Math.random() * available.length)]
  }

  function startGame() {
    usedIds.current.clear()
    const ref = pick()
    usedIds.current.add(ref.id)
    const chal = pick([ref.id])
    usedIds.current.add(chal.id)
    setRefMovie(ref)
    setChallenge(chal)
    setResult(null)
    setScore(0)
    setGameOver(false)
  }

  function handleSwipe(direction) {
    if (result || !challenge || !refMovie) return

    const correct =
      (direction === 'after' && challenge.releaseYear >= refMovie.releaseYear) ||
      (direction === 'before' && challenge.releaseYear < refMovie.releaseYear)

    setResult(correct ? 'correct' : 'wrong')

    if (correct) {
      const newScore = score + 1
      setScore(newScore)
      if (newScore > best) {
        setBest(newScore)
        localStorage.setItem('game_best', newScore)
      }
      setTimeout(() => {
        const next = pick()
        usedIds.current.add(next.id)
        setRefMovie(challenge)
        setChallenge(next)
        setResult(null)
      }, 1200)
    } else {
      setTimeout(() => setGameOver(true), 1200)
    }
  }

  if (pool.length === 0) return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: '#141414' }}>
      <p className="text-gray-500">Loading game...</p>
    </div>
  )

  if (gameOver) return (
    <div className="flex flex-col items-center justify-center gap-6 text-center" style={{ minHeight: '100vh', background: '#141414' }}>
      <p className="text-6xl">🎬</p>
      <h2 className="text-white text-3xl font-black">Game Over</h2>
      <p className="text-gray-400 text-lg">Score: <span className="text-white font-bold">{score}</span></p>
      <p className="text-gray-400">Best: <span className="text-yellow-400 font-bold">{best}</span></p>
      <button
        onClick={startGame}
        className="px-8 py-3 rounded-lg font-semibold text-white transition hover:opacity-80"
        style={{ background: '#E50914' }}
      >Play Again</button>
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4" style={{ minHeight: '100vh', background: '#141414', paddingTop: 80 }}>
      {/* Score */}
      <div className="flex gap-8 text-center">
        <div><p className="text-gray-500 text-xs uppercase tracking-wide">Score</p><p className="text-white text-2xl font-black">{score}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wide">Best</p><p className="text-yellow-400 text-2xl font-black">{best}</p></div>
      </div>

      {/* Reference movie */}
      {refMovie && (
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Reference</p>
          <MoviePoster movie={refMovie} hideYear={false} />
        </div>
      )}

      {/* Instructions */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-red-400 font-semibold">← Before</span>
        <span className="text-gray-600">Was the next movie made...</span>
        <span className="text-green-400 font-semibold">After →</span>
      </div>

      {/* Challenge movie */}
      {challenge && (
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Guess</p>
          <SwipeCard movie={challenge} onSwipe={handleSwipe} result={result} />
        </div>
      )}

      {/* Button fallback for non-swipe */}
      {!result && (
        <div className="flex gap-4">
          <button onClick={() => handleSwipe('before')} className="px-6 py-2.5 rounded-lg font-semibold text-sm transition hover:opacity-80" style={{ background: '#2a2a2a', color: '#f87171' }}>← Before</button>
          <button onClick={() => handleSwipe('after')} className="px-6 py-2.5 rounded-lg font-semibold text-sm transition hover:opacity-80" style={{ background: '#2a2a2a', color: '#4ade80' }}>After →</button>
        </div>
      )}
    </div>
  )
}
