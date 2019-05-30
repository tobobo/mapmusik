import React from 'react';
import Div100vh from 'react-div-100vh';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import VideoManager from './VideoManager.mjs';

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
    previewUrl
    lat
    lng
  }
`;

const Play = () => (
  <Div100vh>
    <Query query={videosQuery} notifyOnNetworkStatusChange>
      {({ loading, data, refetch, networkStatus }) => (
        <VideoManager
          loading={loading}
          data={data}
          refetch={refetch}
          networkStatus={networkStatus}
        />
      )}
    </Query>
  </Div100vh>
);

export default Play;
