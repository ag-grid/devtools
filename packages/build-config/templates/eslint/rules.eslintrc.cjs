module.exports = {
  rules: {
    'no-warning-comments': [
      'warn',
      {
        terms: ['fixme'],
      },
    ],
    'vitest/valid-title': [
      'error',
      {
        allowArguments: true,
      },
    ],
  },
};
