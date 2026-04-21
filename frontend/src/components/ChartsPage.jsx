import { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend)

const QUERY = gql`
  query { movies(limit: 500, offset: 0) {
    movies { id title releaseYear voteAverage popularity genres { name } }
  }}
`

const CHART_DEFAULTS = {
  plugins: { legend: { labels: { color: '#ccc' } } },
  scales: {
    x: { ticks: { color: '#999' }, grid: { color: '#2a2a2a' } },
    y: { ticks: { color: '#999' }, grid: { color: '#2a2a2a' } },
  },
}

export default function ChartsPage() {
  const client = useApolloClient()
  const [movies, setMovies] = useState([])

  useEffect(() => {
    client.query({ query: QUERY }).then((r) => setMovies(r.data?.movies?.movies ?? []))
  }, [client])

  if (movies.length === 0) return (
    <div className="px-12 pt-32 text-gray-500">Loading stats...</div>
  )

  // --- Genre distribution ---
  const genreCount = {}
  movies.forEach((m) => m.genres.forEach((g) => { genreCount[g.name] = (genreCount[g.name] ?? 0) + 1 }))
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const genreData = {
    labels: topGenres.map(([g]) => g),
    datasets: [{
      label: 'Movies',
      data: topGenres.map(([, c]) => c),
      backgroundColor: ['#E50914','#f5a623','#7ed321','#4a90e2','#9b59b6','#1abc9c','#e67e22','#e74c3c','#3498db','#2ecc71'],
    }],
  }

  // --- Movies per decade ---
  const decadeCount = {}
  movies.forEach((m) => {
    if (!m.releaseYear) return
    const decade = Math.floor(m.releaseYear / 10) * 10
    decadeCount[decade] = (decadeCount[decade] ?? 0) + 1
  })
  const decades = Object.entries(decadeCount).sort((a, b) => a[0] - b[0])

  const decadeData = {
    labels: decades.map(([d]) => `${d}s`),
    datasets: [{
      label: 'Movies released',
      data: decades.map(([, c]) => c),
      backgroundColor: '#E50914',
      borderRadius: 4,
    }],
  }

  // --- Rating distribution ---
  const ratingBuckets = Array(10).fill(0)
  movies.forEach((m) => {
    if (m.voteAverage > 0) ratingBuckets[Math.min(Math.floor(m.voteAverage) - 1, 9)]++
  })

  const ratingData = {
    labels: ['1','2','3','4','5','6','7','8','9','10'],
    datasets: [{
      label: 'Number of movies',
      data: ratingBuckets,
      borderColor: '#E50914',
      backgroundColor: 'rgba(229,9,20,0.2)',
      fill: true,
      tension: 0.4,
    }],
  }

  // --- Top 10 most popular ---
  const top10 = [...movies].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 10)

  const popularData = {
    labels: top10.map((m) => m.title.length > 20 ? m.title.slice(0, 20) + '…' : m.title),
    datasets: [{
      label: 'Popularity score',
      data: top10.map((m) => m.popularity ?? 0),
      backgroundColor: '#E50914',
      borderRadius: 4,
    }],
  }

  return (
    <div className="px-12 pb-12 pt-32">
      <h2 className="text-white text-2xl font-bold mb-8">Statistics</h2>

      <div className="grid grid-cols-1 gap-10" style={{ maxWidth: 900 }}>
        {/* Genre distribution */}
        <div className="rounded-xl p-6" style={{ background: '#181818' }}>
          <h3 className="text-white font-semibold mb-4">Top 10 Genres</h3>
          <Bar data={genreData} options={{ ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } }} />
        </div>

        {/* Movies per decade */}
        <div className="rounded-xl p-6" style={{ background: '#181818' }}>
          <h3 className="text-white font-semibold mb-4">Movies per Decade</h3>
          <Bar data={decadeData} options={{ ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } }} />
        </div>

        {/* Rating distribution */}
        <div className="rounded-xl p-6" style={{ background: '#181818' }}>
          <h3 className="text-white font-semibold mb-4">Rating Distribution</h3>
          <Line data={ratingData} options={CHART_DEFAULTS} />
        </div>

        {/* Top 10 popular */}
        <div className="rounded-xl p-6" style={{ background: '#181818' }}>
          <h3 className="text-white font-semibold mb-4">Top 10 Most Popular</h3>
          <Bar data={popularData} options={{ ...CHART_DEFAULTS, indexAxis: 'y', plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } }} />
        </div>
      </div>
    </div>
  )
}
