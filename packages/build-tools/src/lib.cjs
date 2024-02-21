const cli = require('./cli.cjs');
const format = require('./format.cjs');
const parse = require('./parse.cjs');
const prompt = require('./prompt.cjs');
const template = require('./template.cjs');
const validate = require('./validate.cjs');
const workspace = require('./workspace.cjs');

module.exports = {
  ...cli,
  ...format,
  ...parse,
  ...prompt,
  ...template,
  ...validate,
  ...workspace,
};
