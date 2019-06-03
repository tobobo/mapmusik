import React from 'react';
import { Global, css } from '@emotion/core';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import map from 'lodash/fp/map';
import config from '../../../config/client.js';

const LogIn = () => <a href="/auth/wordpress">Log in</a>;

const adminVideosQuery = gql`
  query {
    videos(showHiddenVideos: true) {
      id
      createdAt
      hiddenAt
      previewUrl
    }
  }
`;

const hideVideoMutation = gql`
  mutation($id: ID!) {
    hideVideo(id: $id) {
      id
      hiddenAt
    }
  }
`;

const unhideVideoMutation = gql`
  mutation($id: ID!) {
    unhideVideo(id: $id) {
      id
      hiddenAt
    }
  }
`;

const VideosList = () => (
  <Query query={adminVideosQuery}>
    {({ loading, data }) => {
      if (loading) return 'loading videos...';
      return map(video => (
        <div
          css={{
            height: 200,
            width: '100%',
            border: '1px solid black',
            borderBottom: 1,
            padding: 5,
          }}
        >
          <div css={{ float: 'left' }}>
            {video.hiddenAt && (
              <p css={{ color: '#FF0000' }}>
                <strong>VIDEO HIDDEN</strong>
              </p>
            )}
            <p>
              <strong>id: </strong>
              {video.id}
            </p>
            <p>
              <strong>created at: </strong>
              {video.createdAt}
            </p>
            <p>
              {video.hiddenAt ? (
                <Mutation mutation={unhideVideoMutation}>
                  {unhideVideo => (
                    <button onClick={() => unhideVideo({ variables: { id: video.id } })}>
                      Unhide video
                    </button>
                  )}
                </Mutation>
              ) : (
                <Mutation mutation={hideVideoMutation}>
                  {hideVideo => (
                    <button onClick={() => hideVideo({ variables: { id: video.id } })}>
                      Hide video
                    </button>
                  )}
                </Mutation>
              )}
            </p>
          </div>
          <video
            controls
            css={{ height: '100%', float: 'right' }}
            src={`${config.assetPrefix}${video.previewUrl}`}
          />
        </div>
      ))(data.videos);
    }}
  </Query>
);

const isAuthenticatedQuery = gql`
  query {
    viewer {
      authenticated
    }
  }
`;

const Admin = () => (
  <React.Fragment>
    <Global
      styles={css`
        html,
        body {
          background-color: white;
        }
      `}
    />
    <div css={{ margin: '10px' }}>
      <div css={{ maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' }}>
        <h1>Admin</h1>
        <Query query={isAuthenticatedQuery}>
          {({ loading, data }) => {
            if (loading) return 'loading...';
            return data.viewer.authenticated ? <VideosList /> : <LogIn />;
          }}
        </Query>
      </div>
    </div>
  </React.Fragment>
);

export default Admin;
