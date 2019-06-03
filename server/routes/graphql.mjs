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
    hiddenAt: String
    videoUrl: String!
    thumbnailUrl: String!
    audioUrl: String!
    previewUrl: String
    lat: Float
    lng: Float
  }

  type Query {
    videos(sortBy: VideoSortOrder = NEW, showHiddenVideos: Boolean): [Video!]!
    viewer: Viewer!
  }

  type Mutation {
    hideVideo(id: ID!): Video!
    unhideVideo(id: ID!): Video!
  }
`;

const resolvers = {
  Query: {
    videos: async (_, { sortBy, showHiddenVideos }, { mysqlAdapter, isAuthenticated }) => {
      if (showHiddenVideos) {
        if (!isAuthenticated) throw new Error('must be authenticated to get hidden videos');
        return mysqlAdapter.getVideos();
      }
      if (sortBy === 'FEATURED') return mysqlAdapter.getFeaturedVideos();
      return mysqlAdapter.getPublicVideos();
    },

    viewer: (_, __, { isAuthenticated }) => ({ authenticated: isAuthenticated }),
  },

  Mutation: {
    hideVideo: async (_, { id }, { mysqlAdapter, isAuthenticated }) => {
      if (!isAuthenticated) throw new Error('Must be authenticated to modify videos');
      await mysqlAdapter.updateVideo({ id, hidden_at: new Date() });
      return mysqlAdapter.getVideoById(id);
    },
    unhideVideo: async (_, { id }, { mysqlAdapter, isAuthenticated }) => {
      if (!isAuthenticated) throw new Error('Must be authenticated to modify videos');
      await mysqlAdapter.updateVideo({ id, hidden_at: null });
      return mysqlAdapter.getVideoById(id);
    },
  },

  Video: {
    videoUrl: fp.get('video_url'),
    thumbnailUrl: fp.get('thumbnail_url'),
    audioUrl: fp.get('audio_url'),
    previewUrl: fp.get('preview_url'),
    createdAt: video => (video.created_at ? new Date(video.created_at).toJSON() : null),
    hiddenAt: video => (video.hidden_at ? new Date(video.hidden_at).toJSON() : null),
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
