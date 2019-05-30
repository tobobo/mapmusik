import React from 'react';
import { Global, css } from '@emotion/core';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const LogIn = () => <a href="/auth/wordpress">Log in</a>;

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
            return data.viewer.authenticated ? 'authenticated' : <LogIn />;
          }}
        </Query>
      </div>
    </div>
  </React.Fragment>
);

export default Admin;
