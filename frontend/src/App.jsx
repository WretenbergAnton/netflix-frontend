import { useEffect, useState } from 'react'

const AUTH_SERVER = 'http://localhost:3001'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('jwt'))

  // Pick up token from OAuth redirect (?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (t) {
      localStorage.setItem('jwt', t)
      setToken(t)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  function login() {
    window.location.href = `${AUTH_SERVER}/auth/google`
  }

  function logout() {
    localStorage.removeItem('jwt')
    setToken(null)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Netflix Movies</h1>
          <p className="text-gray-400">Sign in to explore 15 000+ movies</p>
          <button
            onClick={login}
            className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Netflix Movies</h1>
        <button
          onClick={logout}
          className="text-gray-400 hover:text-white transition text-sm"
        >
          Sign out
        </button>
      </div>
      <p className="text-gray-400">Logged in — movies coming soon.</p>
    </div>
  )
}

export default App
