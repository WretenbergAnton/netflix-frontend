import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
})

// Attach the JWT token to every request
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('jwt')
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

// If the API returns an auth error, clear the token and reload so the user sees the login page
const errorLink = onError(({ graphQLErrors, networkError }) => {
  const isAuthError =
    graphQLErrors?.some((e) => e.message.toLowerCase().includes('unauthorized') || e.extensions?.code === 'UNAUTHENTICATED') ||
    networkError?.statusCode === 401

  if (isAuthError) {
    localStorage.removeItem('jwt')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_picture')
    window.location.reload()
  }
})

const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
})

export default client
