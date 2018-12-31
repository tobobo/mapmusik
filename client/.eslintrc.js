module.exports = {
  plugins: ['react'],
  extends: ['plugin:react/recommended'],
  env: {
    browser: 'true',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
};
