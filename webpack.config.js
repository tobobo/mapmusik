const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: ['babel-polyfill', './client/index.mjs'],
  devtool: 'inline-source-map',
  plugins: [new webpack.EnvironmentPlugin(['MAPMUSIK_GOOGLE_MAPS_API_KEY', 'MAPMUSIK_ASSET_PREFIX'])],
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
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: './client',
  },
};
