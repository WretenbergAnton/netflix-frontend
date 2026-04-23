import { useState, useRef, useEffect } from 'react'

// Dropdown profile menu showing the user's avatar, a settings link, and a sign-out button
export default function ProfileMenu({ user, onLogout, onSettings }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    // Close the menu when the user clicks outside of it
    function handleClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="focus:outline-none">
        {user?.picture ? (
          <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full hover:ring-2 hover:ring-white transition" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold hover:ring-2 hover:ring-white transition">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden shadow-2xl z-50"
          style={{ background: '#1f1f1f', border: '1px solid #2e2e2e' }}>

          <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: '#2e2e2e' }}>
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs">Google account</p>
            </div>
          </div>

          <button
            onClick={() => { onSettings?.(); setOpen(false) }}
            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
          >
            Settings
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
            style={{ borderTop: '1px solid #2e2e2e' }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
