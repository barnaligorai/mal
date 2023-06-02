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

const handleDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const handleLet = (ast, env) => {
  const binds = ast.value[1].value;
  const new_env = new Env(env);

  for (let index = 0; index < binds.length; index += 2) {
    const symbol = binds[index];
    const value = binds[index + 1];
    new_env.set(symbol, EVAL(value, new_env));
  }

  return EVAL(ast.value[2], new_env);
};

const handleDo = (ast, env) => {
  const forms = ast.value.slice(1);
  let result = new MalNil();

  forms.forEach(form => {
    result = EVAL(form, env);
  });

  return result;
};

const handleIf = (ast, env) => {
  const [_, condition, ifPart, elsePart] = ast.value;
  const result = EVAL(condition, env);

  if (result === 0) {
    return EVAL(ifPart, env);
  }

  return !(result instanceof MalNil || !result) ?
    EVAL(ifPart, env) :
    (elsePart !== undefined ? EVAL(elsePart, env) : new MalNil);
};

const handleFn = (ast, env) => {
  const [_, binds, body] = ast.value;

  return (...args) => {
    const new_env = new Env(env, binds, args);
    return EVAL(body, new_env);
  };
};

const READ = str => read_str(str);
const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);

  if (ast.is_empty()) return ast;

  switch (ast.value[0].value) {
    case 'def!':
      return handleDef(ast, env);
    case 'let*': {
      return handleLet(ast, env);
    }
    case 'do': {
      return handleDo(ast, env);
    }
    case 'if': {
      return handleIf(ast, env);
    }
    case 'fn*': {
      return handleFn(ast, env);
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
