const React = require('react');
const { default: GoogleMapReact } = require('google-map-react');
const { default: ApolloClient } = require('apollo-client');
const { HttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');
const config = require('../../config/client.json');

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

module.exports = App;
