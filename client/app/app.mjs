import React, { StrictMode } from 'react';
import GoogleMapReact from 'google-map-react';
import Div100vh from 'react-div-100vh';
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
    <Div100vh>
      <div className="map-container" style={{ width: '100%', height: '100%' }}>
        {/* <GoogleMapReact
        bootstrapURLKeys={{ key: config.googleMaps.apiKey }}
        defaultCenter={{ lat: 37.6937518, lng: -97.3775182 }}
        defaultZoom={13}
      /> */}
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'grid',
            gridTemplateRows: '40px 1fr 1fr 1fr 1fr',
            gridTemplateColumns: '1fr 1fr 1fr',
            backgroundColor: 'black',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              gridColumnEnd: 'span 3',
            }}
          >
            Toggle
          </div>
          <Player />
        </div>
      </div>
    </Div100vh>
    {/* </StrictMode> */}
  </ApolloProvider>
);

export default App;
