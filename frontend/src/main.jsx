import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import client from './apollo.js'
import './index.css'
import App from './App.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { CustomMoviesProvider } from './context/CustomMoviesContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <FavoritesProvider>
        <CustomMoviesProvider>
          <App />
        </CustomMoviesProvider>
      </FavoritesProvider>
    </ApolloProvider>
  </StrictMode>,
)
