module.exports = {
  mode: 'development',
  entry: './client/index.mjs',
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
