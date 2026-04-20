import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import cors from 'cors'

const app = express()
const PORT = process.env.SERVER_PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const GRAPHQL_URL = process.env.VITE_GRAPHQL_URL || 'https://netflix-graphql-api-production.up.railway.app/graphql'

app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value
    const name = profile.displayName

    // Try login first, register if not found
    const jwt = await loginOrRegister(email, name)
    done(null, { email, name, jwt })
  }
))

async function graphql(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

async function loginOrRegister(email, name) {
  const loginRes = await graphql(
    `mutation Login($email: String!, $password: String!) {
      loginUser(email: $email, password: $password) { token }
    }`,
    { email, password: process.env.OAUTH_USER_PASSWORD }
  )

  if (loginRes.data?.loginUser?.token) {
    return loginRes.data.loginUser.token
  }

  const registerRes = await graphql(
    `mutation Register($email: String!, $password: String!, $name: String) {
      registerUser(email: $email, password: $password, name: $name) { token }
    }`,
    { email, password: process.env.OAUTH_USER_PASSWORD, name }
  )

  return registerRes.data?.registerUser?.token
}

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}?error=auth_failed` }),
  (req, res) => {
    const token = req.user?.jwt
    res.redirect(`${CLIENT_URL}?token=${token}`)
  }
)

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ ok: true })
  })
})

app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`))
