const readline = require('readline')
const { read_str } = require('./reader.js')
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalValue } = require('./types.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = {
  '+': (...args) => args.reduce((a, b) => new MalValue(a.value + b.value)),
  '-': (...args) => args.reduce((a, b) => new MalValue(a.value - b.value)),
  '*': (...args) => args.reduce((a, b) => new MalValue(a.value * b.value)),
  '/': (...args) => args.reduce((a, b) => new MalValue(a.value / b.value)),
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env[ast.value];
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalList(newAst);
  }

  return ast;
};

const READ = str => read_str(str);
const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);

  if (ast.is_empty()) return ast;

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};
const PRINT = str => pr_str(str);

const rep = str => PRINT(EVAL(READ(str), env));

const repl = () =>
  rl.question('user> ', line => {
    try {
      console.log(rep(line));
    } catch (error) {
      console.log(error);
    }
    repl();
  });

repl();
