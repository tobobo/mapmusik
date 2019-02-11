import React from 'react';
import Div100vh from 'react-div-100vh';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import ApolloClient from 'apollo-client';
import { ApolloProvider, Query } from 'react-apollo';
import { Global, css } from '@emotion/core';
import VideoManager from './components/VideoManager.mjs';

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: '/graphql',
  }),
  cache: new InMemoryCache(),
});

const videosQuery = gql`
  {
    allVideos: videos {
      ...VideoFields
    }
    featuredVideos: videos(sortBy: FEATURED) {
      ...VideoFields
    }
  }

  fragment VideoFields on Video {
    id
    createdAt
    videoUrl
    thumbnailUrl
    audioUrl
    lat
    lng
  }
`;

const App = () => (
  <React.Fragment>
    <Global
      styles={css`
        * {
          font-family: 'Helvetica Neue';
        }
      `}
    />
    <ApolloProvider client={apolloClient}>
      {/* <StrictMode> */}
      <Div100vh>
        <Query query={videosQuery}>
          {({ loading, data }) => <VideoManager loading={loading} data={data} />}
        </Query>
      </Div100vh>
      {/* </StrictMode> */}
    </ApolloProvider>
  </React.Fragment>
);

export default App;
