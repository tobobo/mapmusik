const fp = require('lodash/fp');
const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    videos: [Video!]!
  }

  type Video {
    id: ID!
    videoUrl: String!
  }
`;

const resolvers = {
  Query: {
    videos: (_, __, { mysqlAdapter }) => mysqlAdapter.getVideos(),
  },

  Video: {
    videoUrl: fp.get('video_url'),
  },
};

const setupGraphql = app => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      mysqlAdapter: app.get('mysqlAdapter'),
    }),
  });
  server.applyMiddleware({ app });
};

module.exports = setupGraphql;
