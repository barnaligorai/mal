const readline = require('readline')
const { read_str } = require('./reader.js')
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalVector, MalHashMap, MalNil } = require('./types.js');
const { Env } = require('./env.js');
const { ns } = require('./core.js');

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

const evalDo = (listToEval, env) => {
  let result = new MalNil();
  for (let index = 0; index < listToEval.length; index++) {
    const element = listToEval[index];
    result = EVAL(element, env);
  }
  return result;
};

const evalIf = (condition, ifPart, elsePart, env) => {
  const result = EVAL(condition, env);

  if (result === 0) {
    return EVAL(ifPart, env);
  }

  return !(result instanceof MalNil || !result) ?
    EVAL(ifPart, env) :
    (elsePart !== undefined ? EVAL(elsePart, env) : new MalNil);
};

const evalFn = (bindings, body, env) => {
  return (...args) => {
    const new_env = new Env(env, bindings, args);
    return EVAL(body, new_env);
  };
};

const READ = str => read_str(str);
const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);

  if (ast.is_empty()) return ast;

  switch (ast.value[0].value) {
    case 'def!':
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);
    case 'let*': {
      const bindingList = ast.value[1].value;
      const new_env = createInnerEnv(bindingList, env);
      return EVAL(ast.value[2], new_env);
    }
    case 'do': {
      const listToEval = ast.value.slice(1);
      return evalDo(listToEval, env);
    }
    case 'if': {
      const [_, condition, ifPart, elsePart] = ast.value;
      return evalIf(condition, ifPart, elsePart, env);
    }
    case 'fn*': {
      const [_, args, body] = ast.value;
      return evalFn(args, body, env);
    }
  }

  const [fn, ...args] = eval_ast(ast, env).value;

  return fn.apply(null, args);
};

const PRINT = str => pr_str(str);

const env = new Env();
Object.entries(ns).forEach(([symbol, funcBody]) => env.set(new MalSymbol(symbol), funcBody));

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
