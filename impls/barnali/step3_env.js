const readline = require('readline')
const { read_str } = require('./reader.js')
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalVector, MalHashMap, MalNil } = require('./types.js');
const { Env } = require('./env.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
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

const createInnerEnv = (bindingList, env) => {
  const new_env = new Env(env);

  for (let index = 0; index < bindingList.length; index += 2) {
    const symbol = bindingList[index];
    const value = bindingList[index + 1];
    new_env.set(symbol, EVAL(value, new_env));
  }
  return new_env;
};

const READ = str => read_str(str);
const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);

  if (ast.is_empty()) return ast;

  switch (ast.value[0].value) {
    case 'def!':
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);
    case 'let*':
      const bindingList = ast.value[1].value;
      const new_env = createInnerEnv(bindingList, env);
      return EVAL(ast.value[2], new_env);
  }

  const [fn, ...args] = eval_ast(ast, env).value;

  return fn.apply(null, args);
};

const PRINT = str => pr_str(str);

const env = new Env();
env.set(new MalSymbol('+'), (...args) => args.reduce((a, b) => a + b, 0));
env.set(new MalSymbol('*'), (...args) => args.reduce((a, b) => a * b, 1));
env.set(new MalSymbol('-'), (...args) => args.reduce((a, b) => a - b));
env.set(new MalSymbol('/'), (...args) => args.reduce((a, b) => a / b));

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
