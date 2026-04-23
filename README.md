# Assignment WT - Web for Data Science

## Project Name

Netflix Movie Browser

## Objective

Create a functional, visually engaging, and *interactive* data visualization web application that consumes the API you built in the previous assignment. The application must authenticate users via OAuth and be publicly accessible.

A Netflix-inspired movie browsing application that visualizes a dataset of 15 000+ movies. Users can explore movies by genre, filter by year and rating, search by title, and view interactive charts showing genre distribution, release trends over time, and the most popular movies. The application provides both a browsing experience and statistical insights into the dataset.

## Deployed Application

> URL: https://netflix-frontend-production.up.railway.app

## Requirements

See [all requirements in Issues](../../issues/). Close issues as you implement them. Create additional issues for any custom functionality.

### Functional Requirements

| Requirement | Issue | Status |
|---|---|---|
| API Integration — the app consumes your WT1 API | [#14](../../issues/14) | :white_check_mark: |
| OAuth Authentication — users log in via OAuth 2.0 | [#15](../../issues/15) | :white_check_mark: |
| Interactive data visualization with aggregation/adaptation for 10 000+ data points | [#11](../../issues/11) | :white_check_mark: |
| Efficient loading — pagination, lazy loading, loading indicators | [#13](../../issues/13) | :white_check_mark: |

### Non-Functional Requirements

| Requirement | Issue | Status |
|---|---|---|
| Clear and well-structured code | [#1](../../issues/1) | :white_check_mark: |
| Code reuse | [#2](../../issues/2) | :white_check_mark: |
| Dependency management and scripts | [#3](../../issues/3) | :white_check_mark: |
| Source code documentation | [#4](../../issues/4) | :white_check_mark: |
| Coding standard | [#5](../../issues/5) | :white_check_mark: |
| Examiner can follow the creation process | [#6](../../issues/6) | :white_check_mark: |
| Publicly accessible over the internet | [#7](../../issues/7) | :white_check_mark: |
| Keys and tokens handled correctly | [#8](../../issues/8) | :white_check_mark: |
| Complete assignment report with correct links | [#9](../../issues/9) | :white_check_mark: |

### VG — AI/ML Feature (optional)

For a VG grade, integrate **one** AI/ML feature into the application. Pick one below or propose your own of similar scope. See the [VG issue](../../issues/12) for full details and acceptance criteria.

| Option | Status |
|---|---|
| Semantic Search — natural language queries matched by meaning | :white_large_square: |
| Content-Based Recommendations — "items similar to this one" | :white_large_square: |
| Sentiment Analysis — analyze and visualize text sentiment | :white_large_square: |
| Text Summarization / Generation — LLM-powered summaries | :white_large_square: |
| Clustering & Grouping — auto-group similar items visually | :white_large_square: |
| RAG — natural language Q&A grounded in your dataset | :white_large_square: |
| Other: *describe* | :white_large_square: |

## Core Technologies Used

| Layer | Technology | Why |
|---|---|---|
| **Visualization** | Chart.js + react-chartjs-2 | Widely used, good React integration, supports bar and line charts out of the box |
| **Front-end** | React 19 + Vite | Component-based UI, fast dev server, and easy build pipeline |
| **Styling** | Tailwind CSS v4 | Utility-first CSS, fast to write, consistent dark theme |
| **Data fetching** | Apollo Client | Built-in caching, works natively with GraphQL, avoids duplicate requests |
| **Auth** | Passport.js + Google OAuth 2.0 | Standard library for OAuth flows in Node.js |
| **Hosting** | Railway | Simple Docker-based deployment with automatic HTTPS and restart on failure |

## How to Use

### Browsing movies
- Movies are grouped by genre in horizontally scrollable rows
- Click any movie card to open a detail view with backdrop image, trailer, rating, overview, and cast
- Click ♡ on a card or in the detail view to save a movie to **My List**

### Filtering
- Use the genre pills at the top to filter by a single genre
- Set a year range (e.g. 2000–2020) and a minimum rating (5+, 6+, 7+, 8+) to narrow results
- Click **✕ Clear** to reset all filters

### Search
- Type at least 2 characters in the search bar to search across all 15 000+ movies
- Results appear in a dropdown — click any card to open its detail view

### Stats page
- Shows three charts: top 10 genres, movies released per year, and top 10 most popular movies
- Click any bar in the **Top 10 Genres** chart to jump to the home page filtered by that genre

### Actor Quiz (Game)
- Search for an actor by name or pick one at random
- Select which movies from the four options the actor has appeared in, then press Submit
- Track your score and streak across rounds

### Adding custom movies
- Click the **+** button (bottom right) to add your own movie to the list
- Custom movies appear in the **My Movies** row on the home page

## Local Development

```bash
cd frontend
cp .env.example .env.local   # fill in your keys
npm install
npm run dev                   # starts Vite + Express concurrently
```

## Acknowledgements

- Movie data from the GraphQL API built in the previous assignment (WT1)
- Poster images, backdrops, trailers, and actor photos from [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Google OAuth via [Passport.js](https://www.passportjs.org/)
