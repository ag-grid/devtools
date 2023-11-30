const base = require('./base.eslintrc.cjs');

module.exports = {
  ...base,
  extends: ['airbnb', 'airbnb/hooks', ...base.extends],
};
