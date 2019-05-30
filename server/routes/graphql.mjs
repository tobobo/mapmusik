import fp from 'lodash/fp';
import ApolloServerExpress from 'apollo-server-express';

const { ApolloServer, gql } = ApolloServerExpress;

const typeDefs = gql`
  type Viewer {
    authenticated: Boolean!
  }

  enum VideoSortOrder {
    NEW
    FEATURED
  }

  type Video {
    id: ID!
    createdAt: String!
    videoUrl: String!
    thumbnailUrl: String!
    audioUrl: String!
    previewUrl: String
    lat: Float
    lng: Float
  }

  type Query {
    videos(sortBy: VideoSortOrder = NEW): [Video!]!
    viewer: Viewer!
  }
`;

const resolvers = {
  Query: {
    videos: async (_, { sortBy }, { mysqlAdapter }) => {
      if (sortBy === 'FEATURED') return mysqlAdapter.getFeaturedVideos();
      return mysqlAdapter.getVideos();
    },

    viewer: (_, __, { isAuthenticated }) => ({ authenticated: isAuthenticated }),
  },

  Video: {
    videoUrl: fp.get('video_url'),
    thumbnailUrl: fp.get('thumbnail_url'),
    audioUrl: fp.get('audio_url'),
    previewUrl: fp.get('preview_url'),
    createdAt: video => new Date(video.created_at).toJSON(),
  },
};

export default (app, { isAuthenticated }) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      mysqlAdapter: app.get('mysqlAdapter'),
      isAuthenticated: isAuthenticated(req),
    }),
  });
  server.applyMiddleware({ app });
};
