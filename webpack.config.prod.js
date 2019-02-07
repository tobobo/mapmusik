const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: ['babel-polyfill', './client/index.mjs'],
  plugins: [new webpack.EnvironmentPlugin(['MAPMUSIK_GOOGLE_MAPS_API_KEY', 'MAPMUSIK_ASSET_PREFIX'])],
  optimization: {
    usedExports: true,
  },
  module: {
    rules: [
      {
        test: /\.(mjs)$/,
        type: 'javascript/auto',
      },
      {
        test: /\.(js|mjs)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['*', '.mjs', '.js'],
  },
  output: {
    path: `${__dirname}/prod-bundle`,
    publicPath: '/',
    filename: 'bundle.js',
  },
};
