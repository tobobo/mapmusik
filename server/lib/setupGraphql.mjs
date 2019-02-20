import fp from 'lodash/fp';
import ApolloServerExpress from 'apollo-server-express';

const { ApolloServer, gql } = ApolloServerExpress;

const typeDefs = gql`
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
  }
`;

const resolvers = {
  Query: {
    videos: (_, { sortBy }, { mysqlAdapter }) => {
      if (sortBy === 'FEATURED') return mysqlAdapter.getFeaturedVideos();
      return mysqlAdapter.getVideos();
    },
  },

  Video: {
    videoUrl: fp.get('video_url'),
    thumbnailUrl: fp.get('thumbnail_url'),
    audioUrl: fp.get('audio_url'),
    previewUrl: fp.get('preview_url'),
    createdAt: video => new Date(video.created_at).toJSON(),
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
