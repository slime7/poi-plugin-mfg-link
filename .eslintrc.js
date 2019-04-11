module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: [
    'airbnb',
    'poi-plugin',
  ],
  plugins: [
    'import',
    'react',
  ],
  rules: {
    'import/no-unresolved':
      [2, {
        'ignore':
          [
            'redux',
            'views/utils/game-utils',
            'views/utils/selectors',
            'views/create-store',
            'views/components/etc/avatar',
            'views/components/etc/icon',
            'reselect', 'react-*', 'prop-types',
          ]
      }],
    'react/jsx-filename-extension': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.es'],
      },
    },
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
};
