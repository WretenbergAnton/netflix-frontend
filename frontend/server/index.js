import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import session from 'express-session'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const GRAPHQL_URL = process.env.VITE_GRAPHQL_URL || 'https://netflix-graphql-api-production.up.railway.app/graphql'

app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(session({ secret: process.env.SESSION_SECRET || 'dev-secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value
    const name = profile.displayName
    const picture = profile.photos?.[0]?.value ?? null
    const jwt = await loginOrRegister(email, name)
    done(null, { email, name, picture, jwt })
  }
))

// Send a GraphQL request to the API and return the parsed JSON response
async function graphql(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

// Try to log in the user — if no account exists yet, register one and return the JWT
async function loginOrRegister(email, name) {
  const password = process.env.OAUTH_USER_PASSWORD
  const login = await graphql(
    `mutation Login($email: String!, $password: String!) { loginUser(email: $email, password: $password) { token } }`,
    { email, password }
  )
  if (login.data?.loginUser?.token) return login.data.loginUser.token

  const register = await graphql(
    `mutation Register($email: String!, $password: String!, $name: String) { registerUser(email: $email, password: $password, name: $name) { token } }`,
    { email, password, name }
  )
  return register.data?.registerUser?.token
}

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}?error=auth_failed` }),
  (req, res) => {
    const { jwt, name, picture } = req.user
    res.redirect(`${CLIENT_URL}?${new URLSearchParams({ token: jwt, name, picture: picture ?? '' })}`)
  }
)

const distPath = join(dirname(fileURLToPath(import.meta.url)), '../dist')
app.use(express.static(distPath))
app.get('/{*splat}', (req, res) => res.sendFile(join(distPath, 'index.html')))

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
