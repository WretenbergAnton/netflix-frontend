import { useEffect, useState } from 'react'
import MovieList from './components/MovieList.jsx'
import SearchBar from './components/SearchBar.jsx'
import ProfileMenu from './components/ProfileMenu.jsx'
import HeroBanner from './components/HeroBanner.jsx'
import MyListPage from './components/MyListPage.jsx'
import ChartsPage from './components/ChartsPage.jsx'
import { useFavoritesContext } from './context/FavoritesContext.jsx'

const AUTH_SERVER = 'http://localhost:3001'

function AppContent({ user, logout }) {
  const [page, setPage] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const { favorites } = useFavoritesContext()

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLink = (label, target) => (
    <button
      onClick={() => setPage(target)}
      className="text-sm font-medium transition"
      style={{ color: page === target ? 'white' : '#b3b3b3' }}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen text-white" style={{ background: '#141414' }}>
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center px-12 py-4 transition-all duration-300"
        style={{ background: scrolled || page !== 'home' ? 'rgba(20,20,20,0.97)' : 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}
      >
        <button
          onClick={() => setPage('home')}
          className="text-2xl font-black tracking-tight mr-8 flex-shrink-0"
          style={{ color: '#E50914' }}
        >NETFLIX</button>

        <div className="flex items-center gap-6 mr-8 flex-shrink-0">
          {navLink('Home', 'home')}
          {navLink('Stats', 'stats')}
          <button
            onClick={() => setPage('mylist')}
            className="text-sm font-medium transition flex items-center gap-1"
            style={{ color: page === 'mylist' ? 'white' : '#b3b3b3' }}
          >
            My List {favorites.length > 0 && (
              <span className="text-xs rounded-full px-1.5 py-0.5 font-bold" style={{ background: '#E50914', color: 'white' }}>
                {favorites.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>
        <div className="flex-shrink-0 ml-8">
          <ProfileMenu user={user} onLogout={logout} />
        </div>
      </nav>

      {page === 'home' && (
        <>
          <HeroBanner />
          <div className="px-12 pb-12 -mt-4">
            <MovieList />
          </div>
        </>
      )}

      {page === 'mylist' && <MyListPage />}
      {page === 'stats' && <ChartsPage />}
    </div>
  )
}

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
      <div className="min-h-screen text-white flex items-center justify-center" style={{ background: '#141414' }}>
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-black tracking-tight" style={{ color: '#E50914' }}>NETFLIX</h1>
          <p className="text-gray-400 text-lg">Sign in to explore 15 000+ movies</p>
          <a
            href={`${AUTH_SERVER}/auth/google`}
            className="inline-flex items-center gap-3 bg-white text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition text-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
            Sign in with Google
          </a>
        </div>
      </div>
    )
  }

  return <AppContent user={user} logout={logout} />
}

export default App
