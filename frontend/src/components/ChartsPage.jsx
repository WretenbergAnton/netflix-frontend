import { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const QUERY = gql`
  query Charts($limit: Int, $offset: Int) {
    movies(limit: $limit, offset: $offset) {
      totalCount
      movies { id title releaseYear popularity genres { name } }
    }
  }
`

const baseOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a1a', titleColor: '#fff', bodyColor: '#ccc' } },
  scales: {
    x: { ticks: { color: '#888', font: { size: 12 } }, grid: { color: '#242424' } },
    y: { ticks: { color: '#888', font: { size: 12 } }, grid: { color: '#242424' } },
  },
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: '#181818', border: '1px solid #242424' }}>
      <h3 className="text-white font-semibold text-base mb-6">{title}</h3>
      {children}
    </div>
  )
}

export default function ChartsPage() {
  const client = useApolloClient()
  const [movies, setMovies] = useState([])

  useEffect(() => {
    async function loadAll() {
      // First fetch to get totalCount
      const first = await client.query({ query: QUERY, variables: { limit: 1000, offset: 0 } })
      const total = first.data?.movies?.totalCount ?? 0
      const firstBatch = first.data?.movies?.movies ?? []

      // Fetch remaining pages in parallel
      const pages = Math.ceil(total / 1000)
      const rest = await Promise.all(
        Array.from({ length: pages - 1 }, (_, i) =>
          client.query({ query: QUERY, variables: { limit: 1000, offset: (i + 1) * 1000 } })
            .then((r) => r.data?.movies?.movies ?? [])
            .catch(() => [])
        )
      )
      setMovies([...firstBatch, ...rest.flat()])
    }
    loadAll()
  }, [client])

  if (movies.length === 0) return (
    <div className="px-12 pt-32 text-gray-500 text-sm">Loading stats...</div>
  )

  // Genre distribution
  const genreCount = {}
  movies.forEach((m) => m.genres.forEach((g) => { genreCount[g.name] = (genreCount[g.name] ?? 0) + 1 }))
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const genreData = {
    labels: topGenres.map(([g]) => g),
    datasets: [{
      data: topGenres.map(([, c]) => c),
      backgroundColor: ['#E50914','#f5a623','#7ed321','#4a90e2','#9b59b6','#1abc9c','#e67e22','#e74c3c','#3498db','#2ecc71'],
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  // Movies per decade
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
      data: decades.map(([, c]) => c),
      backgroundColor: '#E50914',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  // Top 10 most popular
  const top10 = [...movies].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 10)

  const popularData = {
    labels: top10.map((m) => m.title.length > 22 ? m.title.slice(0, 22) + '…' : m.title),
    datasets: [{
      data: top10.map((m) => Math.round(m.popularity ?? 0)),
      backgroundColor: top10.map((_, i) => i === 0 ? '#E50914' : '#4a90e2'),
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  return (
    <div className="px-12 pb-16 pt-32">
      <h2 className="text-white text-2xl font-bold mb-2">Statistics</h2>
      <p className="text-gray-500 text-sm mb-10">Based on {movies.length} movies</p>

      <div className="grid grid-cols-2 gap-6" style={{ maxWidth: 1100 }}>
        {/* Top genres — full width */}
        <div className="col-span-2">
          <ChartCard title="Top 10 Genres">
            <div style={{ height: 280 }}>
              <Bar data={genreData} options={{ ...baseOptions, maintainAspectRatio: false }} />
            </div>
          </ChartCard>
        </div>

        {/* Movies per decade */}
        <ChartCard title="Movies per Decade">
          <div style={{ height: 260 }}>
            <Bar data={decadeData} options={{ ...baseOptions, maintainAspectRatio: false }} />
          </div>
        </ChartCard>

        {/* Top 10 popular — horizontal */}
        <ChartCard title="Top 10 Most Popular">
          <div style={{ height: 260 }}>
            <Bar
              data={popularData}
              options={{
                ...baseOptions,
                indexAxis: 'y',
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#888' }, grid: { color: '#242424' } },
                  y: { ticks: { color: '#ccc', font: { size: 11 } }, grid: { display: false } },
                },
              }}
            />
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
