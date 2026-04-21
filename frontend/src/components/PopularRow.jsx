import { useState, useEffect, useRef } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import MovieCard from './MovieCard.jsx'

const SEARCH = gql`
  query Search($title: String!) {
    searchMovies(title: $title) {
      id title releaseYear rating voteAverage popularity
      genres { name }
    }
  }
`

const POPULAR_TITLES = [
  'Avengers: Endgame',
  'Avengers: Infinity War',
  'Iron Man',
  'Captain America: The Winter Soldier',
  'Spider-Man: No Way Home',
  'The Dark Knight',
  'The Batman',
  'Black Panther',
  'Deadpool',
  'Logan',

  'Interstellar',
  'Inception',
  'Dune',
  'Dune: Part Two',
  'The Matrix',
  'Blade Runner 2049',
  'Arrival',
  'Gravity',
  'Tenet',
  'Edge of Tomorrow',

  'Gladiator',
  'Mad Max: Fury Road',
  'John Wick',
  'John Wick: Chapter 4',
  'Mission: Impossible - Fallout',
  'Mission: Impossible - Dead Reckoning',
  'Top Gun: Maverick',
  'Pirates of the Caribbean: The Curse of the Black Pearl',

  'The Lord of the Rings: The Fellowship of the Ring',
  'The Lord of the Rings: The Two Towers',
  'The Lord of the Rings: The Return of the King',
  'Harry Potter and the Sorcerer’s Stone',
  'Harry Potter and the Deathly Hallows Part 2',
  'The Hobbit: An Unexpected Journey',

  'Oppenheimer',
  'The Shawshank Redemption',
  'Forrest Gump',
  'Fight Club',
  'The Social Network',
  'Whiplash',
  'Parasite',
  'Joker',

  'The Wolf of Wall Street',
  'Goodfellas',
  'The Godfather',
  'The Godfather Part II',
  'Scarface',
  'The Departed',

  'Superbad',
  'Step Brothers',
  'The Hangover',
  '21 Jump Street',
  'Deadpool',
  'Mean Girls',

  'Titanic',
  'La La Land',
  'The Notebook',
  'Pride & Prejudice',

  'The Conjuring',
  'Get Out',
  'A Quiet Place',
  'It',
  'Hereditary',
  'The Nun',

  'Barbie',
  'Everything Everywhere All at Once',
  'The Menu',
  'Glass Onion: A Knives Out Mystery',
  'No Time to Die',
  'Doctor Strange in the Multiverse of Madness',
];

export default function PopularRow() {
  const client = useApolloClient()
  const [movies, setMovies] = useState([])
  const ref = useRef()

  useEffect(() => {
    async function load() {
      const results = await Promise.all(
        POPULAR_TITLES.map((title) =>
          client.query({ query: SEARCH, variables: { title } }).catch(() => null)
        )
      )
      const all = results
        .flatMap((r) => r?.data?.searchMovies ?? [])
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)

      setMovies(all)
    }
    load()
  }, [client])

  if (movies.length === 0) return null

  return (
    <div className="mb-10 pt-8">
      <h2 className="text-white font-semibold text-lg mb-3">Popular</h2>
      <div className="relative group">
        <button
          onClick={() => ref.current.scrollBy({ left: -600, behavior: 'smooth' })}
          className="absolute left-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-r from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl"
        >‹</button>
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-8" style={{ scrollbarWidth: 'none' }}>
          {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
        <button
          onClick={() => ref.current.scrollBy({ left: 600, behavior: 'smooth' })}
          className="absolute right-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-l from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition text-white text-2xl"
        >›</button>
      </div>
    </div>
  )
}
