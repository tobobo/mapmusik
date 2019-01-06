import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const videosQuery = gql`
  {
    videos {
      id
      videoUrl
    }
  }
`;

const Player = () => (
  <Query query={videosQuery}>
    {({ loading, data }) => {
      if (loading) return 'loading...';
      return <pre>{JSON.stringify(data, null, 2)}</pre>;
    }}
  </Query>
);

export default Player;
