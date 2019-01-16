import fp from 'lodash/fp';
import ApolloServerExpress from 'apollo-server-express';

const { ApolloServer, gql } = ApolloServerExpress;

const typeDefs = gql`
  type Query {
    videos: [Video!]!
  }

  type Video {
    id: ID!
    videoUrl: String!
    thumbnailUrl: String!
    audioUrl: String!
    lat: Float!
    lng: Float!
  }
`;

const resolvers = {
  Query: {
    videos: (_, __, { mysqlAdapter }) => mysqlAdapter.getVideos(),
  },

  Video: {
    videoUrl: fp.get('video_url'),
    thumbnailUrl: fp.get('thumbnail_url'),
    audioUrl: fp.get('audio_url'),
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

export default setupGraphql;
