const rules = require('./rules.cjs');

module.exports = {
  root: true,
  env: {
    es2022: true,
  },
  extends: ['plugin:vitest/recommended', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint', 'vitest'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['.eslintrc.cjs'],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  rules,
};
