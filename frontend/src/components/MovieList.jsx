import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'

const MOVIES_QUERY = gql`
  query Movies($limit: Int, $offset: Int) {
    movies(limit: $limit, offset: $offset) {
      totalCount
      movies {
        id
        title
        releaseYear
      }
    }
  }
`

export default function MovieList() {
  const { data, loading, error } = useQuery(MOVIES_QUERY, {
    variables: { limit: 20, offset: 0 },
  })

  if (loading) return <p className="text-gray-400">Loading...</p>
  if (error) return <p className="text-red-400">Error: {error.message}</p>

  return (
    <div>
      <p className="text-gray-500 text-sm mb-4">{data.movies.totalCount} movies total</p>
      <ul className="space-y-2">
        {data.movies.movies.map((movie) => (
          <li key={movie.id} className="text-white">
            {movie.title} <span className="text-gray-500 text-sm">({movie.releaseYear})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
