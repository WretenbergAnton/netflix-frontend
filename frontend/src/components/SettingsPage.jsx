// Settings page showing the user's profile info and a sign-out button
export default function SettingsPage({ user, onLogout }) {
  return (
    <div className="px-4 sm:px-12 pb-12 pt-20 sm:pt-32 max-w-md">
      <h2 className="text-white text-2xl font-bold mb-8">Settings</h2>

      {/* Profile card */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: '#181818', border: '1px solid #2a2a2a' }}>
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-4">Account</p>
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-gray-500 text-sm">Google account</p>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#181818', border: '1px solid #2a2a2a' }}>
        <button
          onClick={onLogout}
          className="w-full text-left px-6 py-4 text-sm font-medium transition hover:bg-white/5"
          style={{ color: '#E50914' }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
