const readline = require('readline')
const { read_str } = require('./reader.js')
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalVector, MalHashMap } = require('./types.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '-': (...args) => args.reduce((a, b) => a - b),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '/': (...args) => args.reduce((a, b) => a / b),
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env[ast.value];
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalList(newAst);
  }

  if (ast instanceof MalVector) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalVector(newAst);
  }

  if (ast instanceof MalHashMap) {
    const newAst = ast.value.map((x, i) => {
      if (i % 2 === 0) {
        return x;
      }
      return EVAL(x, env);
    });
    return new MalHashMap(newAst);
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
