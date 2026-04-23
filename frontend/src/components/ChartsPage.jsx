import { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Title, Tooltip, Legend)

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

export default function ChartsPage({ onGenreClick }) {
  const client = useApolloClient()
  const [movies, setMovies] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch 3 pages of 1000 = 3000 movies, enough for representative statistics
    async function load() {
      const pages = await Promise.all(
        [0, 1, 2].map((i) =>
          client.query({ query: QUERY, variables: { limit: 1000, offset: i * 1000 } })
            .then((r) => r.data?.movies?.movies ?? [])
        )
      )
      setMovies(pages.flat())
    }
    load().catch(() => setError('Could not load statistics. Please try again.'))
  }, [client])

  if (error) return (
    <div className="px-12 pt-32 text-red-400 text-sm">{error}</div>
  )

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

  // Movies per year (line)
  const yearCount = {}
  movies.forEach((m) => {
    if (!m.releaseYear || m.releaseYear < 1980 || m.releaseYear > 2024) return
    yearCount[m.releaseYear] = (yearCount[m.releaseYear] ?? 0) + 1
  })
  const years = Object.entries(yearCount).sort((a, b) => a[0] - b[0])

  const yearData = {
    labels: years.map(([y]) => y),
    datasets: [{
      label: 'Movies',
      data: years.map(([, c]) => c),
      borderColor: '#E50914',
      backgroundColor: 'rgba(229,9,20,0.15)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: '#E50914',
      borderWidth: 2,
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
    <div className="px-4 sm:px-12 pb-16 pt-20 sm:pt-32">
      <h2 className="text-white text-2xl font-bold mb-2">Statistics</h2>
      <p className="text-gray-500 text-sm mb-10">Based on {movies.length} movies</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ maxWidth: 1100 }}>
        {/* Top genres — full width */}
        <div className="col-span-2">
          <ChartCard title="Top 10 Genres — click a bar to browse that genre">
            <div style={{ height: 280 }}>
              <Bar
                data={genreData}
                options={{
                  ...baseOptions,
                  maintainAspectRatio: false,
                  cursor: 'pointer',
                  onClick: (_, elements) => {
                    if (elements[0]) onGenreClick?.(topGenres[elements[0].index][0])
                  },
                }}
              />
            </div>
          </ChartCard>
        </div>

        {/* Movies per year — full width line chart */}
        <div className="col-span-2">
          <ChartCard title="Movies Released per Year">
            <div style={{ height: 280 }}>
              <Line data={yearData} options={{
                ...baseOptions,
                maintainAspectRatio: false,
                plugins: { ...baseOptions.plugins, legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#888', maxTicksLimit: 15 }, grid: { color: '#242424' } },
                  y: { ticks: { color: '#888' }, grid: { color: '#242424' }, beginAtZero: false },
                },
              }} />
            </div>
          </ChartCard>
        </div>

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
