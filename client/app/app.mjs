import React from 'react';
import GoogleMapReact from 'google-map-react';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import config from '../../config/client.json';

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: '/graphql',
    // credentials: 'same-origin',
  }),
  cache: new InMemoryCache(),
});

const App = () => (
  <div className="map-container">
    {/* <GoogleMapReact
      bootstrapURLKeys={{ key: config.googleMaps.apiKey }}
      defaultCenter={{ lat: 37.6937518, lng: -97.3775182 }}
      defaultZoom={13}
    /> */}
  </div>
);

export default App;
