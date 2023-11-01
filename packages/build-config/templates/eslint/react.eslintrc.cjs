const base = require('./base.eslintrc.cjs');

module.exports = {
  ...base,
  extends: ['plugin:react-hooks/recommended', ...base.extends],
};
