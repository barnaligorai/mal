const { MalList, MalNil, MalValue, MalString } = require('./types.js');
const { pr_str } = require('./printer.js');

const isEqual = (item1, item2) => {
  if (Array.isArray(item1) && Array.isArray(item2) && item1.length === item2.length) {
    return item1.every((item, index) => {
      if (item instanceof MalValue && item2[index] instanceof MalValue) {
        return item.equals(item2[index]);
      }
      return item === item2[index];
    });
  }
  return item1 === item2;
};

const ns = {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '-': (...args) => args.reduce((a, b) => a - b),
  '/': (...args) => args.reduce((a, b) => a / b),

  'list': (...args) => new MalList(args),

  'prn': (...args) => {
    console.log(args.map(e => pr_str(e)).join(" "));
    return new MalNil();
  },

  'count': (...args) => (args[0] instanceof MalNil) ? 0 : args[0].value.length,

  'empty?': (...args) => (args[0].value.length > 0) ? false : true,

  'list?': (...args) => (args[0] instanceof MalList) ? true : false,

  '=': (...args) => args.slice(0, -1).every((item, index) => {
    if (item instanceof MalValue && args[index + 1] instanceof MalValue) {
      return isEqual(item.value, args[index + 1].value);
    }
    return item === args[index + 1];
  }),

  '>': (...args) => args.slice(0, -1).every((item, index) => item > args[index + 1]),

  '>=': (...args) => args.slice(0, -1).every((item, index) => item >= args[index + 1]),

  '<=': (...args) => args.slice(0, -1).every((item, index) => item <= args[index + 1]),

  '<': (...args) => args.slice(0, -1).every((item, index) => item < args[index + 1]),

  'not': (...args) => {
    const value = args[0];
    if (value === 0) return false;
    if (value instanceof MalNil) return true;
    return !value;
  },

  'str': (...args) => {
    return new MalString(args.reduce((x, y) => x + (y instanceof MalValue ? y.pr_str() : y), ""))
  }
};

module.exports = { ns };