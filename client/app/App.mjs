import React from 'react';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Play from './components/Play.mjs';
import Admin from './components/Admin.mjs';

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: '/graphql',
  }),
  cache: new InMemoryCache(),
});

const App = () => (
  <React.Fragment>
    <ApolloProvider client={apolloClient}>
      <Router>
        <Route exact path="/" component={Play} />
        <Route exact path="/admin" component={Admin} />
      </Router>
    </ApolloProvider>
  </React.Fragment>
);

export default App;
