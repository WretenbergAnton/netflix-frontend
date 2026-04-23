import { useEffect, useState } from 'react'
import MovieList from './components/MovieList.jsx'
import SearchBar from './components/SearchBar.jsx'
import ProfileMenu from './components/ProfileMenu.jsx'
import HeroBanner from './components/HeroBanner.jsx'
import MyListPage from './components/MyListPage.jsx'
import ChartsPage from './components/ChartsPage.jsx'
import GamePage from './components/GamePage.jsx'
import { useFavoritesContext } from './context/FavoritesContext.jsx'

const AUTH_SERVER = import.meta.env.VITE_AUTH_SERVER_URL ?? 'http://localhost:3001'

// Main layout with nav bar and page routing once the user is logged in
function AppContent({ user, logout }) {
  const [page, setPage] = useState('home')
  const [homeGenre, setHomeGenre] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { favorites } = useFavoritesContext()

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Navigate to a page and close the mobile menu
  function go(target) {
    setPage(target)
    setMenuOpen(false)
  }

  const navLink = (label, target) => (
    <button
      onClick={() => go(target)}
      className="text-sm font-medium transition"
      style={{ color: page === target ? 'white' : '#b3b3b3' }}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen text-white" style={{ background: '#141414' }}>
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{ background: scrolled || page !== 'home' || menuOpen ? 'rgba(20,20,20,0.97)' : 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}
      >
        {/* Main nav row */}
        <div className="flex items-center px-4 sm:px-12 py-3 gap-4">
          <button
            onClick={() => go('home')}
            className="text-2xl font-black tracking-tight flex-shrink-0"
            style={{ color: '#E50914' }}
          >NETFLIX</button>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
            {navLink('Home', 'home')}
            {navLink('Stats', 'stats')}
            {navLink('Game', 'game')}
            <button
              onClick={() => go('mylist')}
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

          {/* Desktop search */}
          <div className="hidden sm:flex flex-1 justify-center mx-4">
            <SearchBar />
          </div>

          {/* Desktop profile */}
          <div className="hidden sm:block flex-shrink-0">
            <ProfileMenu user={user} onLogout={logout} />
          </div>

          {/* Mobile: profile + hamburger */}
          <div className="flex sm:hidden items-center gap-3 ml-auto">
            <ProfileMenu user={user} onLogout={logout} />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex flex-col justify-center gap-1.5 w-8 h-8 flex-shrink-0"
              aria-label="Menu"
            >
              <span className="block h-0.5 w-6 rounded transition-all duration-200" style={{ background: 'white', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
              <span className="block h-0.5 w-6 rounded transition-all duration-200" style={{ background: 'white', opacity: menuOpen ? 0 : 1 }} />
              <span className="block h-0.5 w-6 rounded transition-all duration-200" style={{ background: 'white', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
            </button>
          </div>
        </div>

      </nav>

      {/* Full-screen mobile menu overlay */}
      <div
        className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-8 sm:hidden transition-all duration-300"
        style={{
          background: 'rgba(20,20,20,0.97)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-16px)',
        }}
      >
        {[
          { label: 'Home', target: 'home' },
          { label: 'Stats', target: 'stats' },
          { label: 'Game', target: 'game' },
          { label: 'My List', target: 'mylist' },
        ].map(({ label, target }) => (
          <button
            key={target}
            onClick={() => go(target)}
            className="text-3xl font-bold transition-colors duration-200"
            style={{ color: page === target ? '#E50914' : 'white' }}
          >
            {label}
            {target === 'mylist' && favorites.length > 0 && (
              <span className="ml-2 text-sm rounded-full px-2 py-0.5 font-bold align-middle" style={{ background: '#E50914', color: 'white' }}>
                {favorites.length}
              </span>
            )}
          </button>
        ))}
        <div className="w-64 mt-4">
          <SearchBar />
        </div>
      </div>

      {page === 'home' && (
        <>
          <HeroBanner />
          <div className="px-4 sm:px-12 pb-12 -mt-4">
            <MovieList initialGenre={homeGenre} onGenreUsed={() => setHomeGenre('')} />
          </div>
        </>
      )}

      {page === 'mylist' && <MyListPage />}
      {page === 'stats' && (
        <ChartsPage onGenreClick={(genre) => { setHomeGenre(genre); setPage('home') }} />
      )}
      {page === 'game' && <GamePage />}
    </div>
  )
}

// Root component — shows the login screen if no JWT is stored, otherwise renders the app
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

  // Clear all stored auth data and return to the login screen
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
