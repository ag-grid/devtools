const base = require('./base.eslintrc.cjs');

module.exports = {
  ...base,
  extends: ['airbnb-base', ...base.extends],
};
