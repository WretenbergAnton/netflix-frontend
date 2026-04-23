import { useFavoritesContext } from '../context/FavoritesContext.jsx'
import MovieCard from './MovieCard.jsx'

// Page that displays all movies the user has saved to their list
export default function MyListPage() {
  const { favorites } = useFavoritesContext()

  return (
    <div className="px-12 pb-12 pt-32">
      <h2 className="text-white text-2xl font-bold mb-6">My List</h2>
      {favorites.length === 0 ? (
        <p className="text-gray-500">You haven't saved any movies yet. Click ♡ on a movie to save it.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {favorites.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}
    </div>
  )
}
