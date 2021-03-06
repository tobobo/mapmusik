module.exports = {
  extends: ['change-base', 'prettier'],

  plugins: ['prettier'],

  rules: {
    'prettier/prettier': ['error'],
    'no-console': ['warn'],
    'import/no-extraneous-dependencies': ['error', { 'devDependencies': ['./server/startDevServer.mjs', './webpack.config.js', './webpack.config.prod.js'] }],
    'import/extensions': ['never'],
  },
};
