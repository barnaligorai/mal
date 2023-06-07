const { MalList, MalNil, MalValue, MalString, MalAtom, MalVector } = require('./types.js');
const { pr_str } = require('./printer.js');
const { read_str } = require('./reader.js');
const fs = require('fs');

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

  'list': (...args) => new MalList(args),

  'list?': (...args) => (args[0] instanceof MalList) ? true : false,

  'count': (...args) => (args[0] instanceof MalNil) ? 0 : args[0].value.length,

  'empty?': (...args) => (args[0].value.length > 0) ? false : true,

  'pr-str': (...args) => pr_str(new MalString(args.map(x => pr_str(x, true)).join(" ")), true),

  'println': (...args) => {
    const str = args.map(x => pr_str(x, false)).join(" ");
    console.log(str);
    return new MalNil();
  },

  'prn': (...args) => {
    const str = args.map(x => pr_str(x, true)).join(" ");
    console.log(str);
    return new MalNil();
  },

  'str': (...args) => new MalString(args.map(x => pr_str(x, false)).join("")),

  'read-string': (string) => read_str(string.value),

  'slurp': fileName => new MalString(fs.readFileSync(fileName.value, 'utf8')),

  'atom': value => new MalAtom(value),

  'atom?': value => value instanceof MalAtom,

  'reset!': (atom, value) => atom.reset(value),

  'deref': atom => atom.deref(),

  'swap!': (atom, f, ...args) => atom.swap(f, args),

  'cons': (value, list) => new MalList([value, ...list.value]),

  'concat': (...lists) => new MalList(lists.flatMap(x => x.value)),

  'vec': (list) => new MalVector(list.value),

  'nth': (list, n) => list.nth(n),

  'first': (list) => list instanceof MalNil ? new MalNil() : list.first(),

  'rest': (list) => list instanceof MalNil ? new MalList([]) : list.rest(),
};

module.exports = { ns };