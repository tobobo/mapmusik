import React, { StrictMode } from 'react';
import GoogleMapReact from 'google-map-react';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import Player from './components/Player.mjs';

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: '/graphql',
  }),
  cache: new InMemoryCache(),
});

const App = () => (
  <ApolloProvider client={apolloClient}>
    {/* <StrictMode> */}
    <div className="map-container">
      <Player />
      {/* <GoogleMapReact
        bootstrapURLKeys={{ key: config.googleMaps.apiKey }}
        defaultCenter={{ lat: 37.6937518, lng: -97.3775182 }}
        defaultZoom={13}
      /> */}
    </div>
    {/* </StrictMode> */}
  </ApolloProvider>
);

export default App;
