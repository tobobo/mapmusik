module.exports = {
  plugins: ['react', 'react-hooks'],
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
        extensions: ['.mjs'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
  },
};
