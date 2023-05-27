const { MalValue } = require('./types.js');

const pr_str = value => {
  return (value instanceof MalValue) ? value.pr_str() : value;
};

module.exports = { pr_str };
