import React, { useState } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
import Div100vh from 'react-div-100vh';
import ApolloClient from 'apollo-client';
import flowRight from 'lodash/fp/flowRight';
import map from 'lodash/fp/map';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { ApolloProvider, Query } from 'react-apollo';
import Player from './components/Player.mjs';
import config from '../../config/client.json';

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: '/graphql',
  }),
  cache: new InMemoryCache(),
});

const useToggle = (initialState = false) => {
  const [enabled, setEnabled] = useState(initialState);
  const enable = () => setEnabled(true);
  const disable = () => setEnabled(false);
  return { enabled, enable, disable };
};

const Map = flowRight(
  withScriptjs,
  withGoogleMap
)(() => (
  <GoogleMap
    defaultZoom={14}
    defaultCenter={{ lat: 37.68, lng: -97.33 }}
    options={{ mapTypeControl: false, zoomControl: false, streetViewControl: false }}
  />
));

const videosQuery = gql`
  {
    videos {
      id
      videoUrl
      thumbnailUrl
      audioUrl
      lat
      lng
    }
  }
`;

const App = () => {
  const { enabled: isShowingPlayer, enable: hidePlayer, disable: showPlayer } = useToggle(true);
  return (
    <ApolloProvider client={apolloClient}>
      {/* <StrictMode> */}
      <Div100vh>
        <Query query={videosQuery}>
          {({ loading, data }) => (
            <div
              style={{
                height: '100%',
                width: '100%',
                display: 'grid',
                // gridTemplateRows: '40px 1fr',
                gridTemplateRows: '1fr',
                gridTemplateColumns: '1fr',
                backgroundColor: 'black',
              }}
            >
              {/* <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'black',
                  gridColumnEnd: 'span 3',
                }}
              >
                <button onClick={showPlayer}>map</button>
                <button onClick={hidePlayer}>Sampler</button>
              </div> */}
              <div>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <div
                    className="map-container"
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                  >
                    <Map
                      googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${
                        config.googleMaps.apiKey
                      }&v=3.exp&libraries=geometry,drawing,places`}
                      loadingElement={<div style={{ height: '100%' }} />}
                      containerElement={<div style={{ height: '100%' }} />}
                      mapElement={<div style={{ height: '100%' }} />}
                    >
                      {/* {!loading &&
                        map(({ lat, lng, id }) => {debugger; return <Marker position={{ lat, lng }} key={id} />})(
                          data.videos
                        )} */}
                    </Map>
                  </div>
                  {isShowingPlayer && !loading && <Player videos={data.videos} />}
                </div>
              </div>
            </div>
          )}
        </Query>
      </Div100vh>
      {/* </StrictMode> */}
    </ApolloProvider>
  );
};

export default App;
