import React, { useState } from 'react';
import GoogleMapReact from 'google-map-react';
import Div100vh from 'react-div-100vh';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
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

const App = () => {
  const { enabled: isShowingPlayer, enable: hidePlayer, disable: showPlayer } = useToggle(true);
  return (
    <ApolloProvider client={apolloClient}>
      {/* <StrictMode> */}
      <Div100vh>
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'grid',
            gridTemplateRows: '40px 1fr',
            gridTemplateColumns: '1fr',
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
            <button onClick={showPlayer}>map</button>
            <button onClick={hidePlayer}>Sampler</button>
          </div>
          <div>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <div
                className="map-container"
                style={{ width: '100%', height: '100%', position: 'absolute' }}
              >
                <GoogleMapReact
                  bootstrapURLKeys={{ key: config.googleMaps.apiKey }}
                  defaultCenter={{ lat: 37.6937518, lng: -97.3775182 }}
                  defaultZoom={13}
                />
              </div>
              {isShowingPlayer && <Player />}
            </div>
          </div>
        </div>
      </Div100vh>
      {/* </StrictMode> */}
    </ApolloProvider>
  );
};

export default App;
