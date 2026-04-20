import { useEffect, useState } from 'react'
import MovieList from './components/MovieList.jsx'

const AUTH_SERVER = 'http://localhost:3001'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('jwt'))
  const [user, setUser] = useState(() => {
    const name = localStorage.getItem('user_name')
    const picture = localStorage.getItem('user_picture')
    return name ? { name, picture } : null
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (t) {
      const name = params.get('name') ?? ''
      const picture = params.get('picture') ?? ''
      localStorage.setItem('jwt', t)
      localStorage.setItem('user_name', name)
      localStorage.setItem('user_picture', picture)
      setToken(t)
      setUser({ name, picture })
      window.history.replaceState({}, '', '/')
    }
  }, [])

  function logout() {
    localStorage.removeItem('jwt')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_picture')
    setToken(null)
    setUser(null)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Netflix Movies</h1>
          <p className="text-gray-400">Sign in to explore 15 000+ movies</p>
          <a
            href={`${AUTH_SERVER}/auth/google`}
            className="inline-block bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Sign in with Google
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Netflix</h1>
        <div className="flex items-center gap-3">
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-gray-300 text-sm">{user?.name}</span>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
      <MovieList />
    </div>
  )
}

export default App
