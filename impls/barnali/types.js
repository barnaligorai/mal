const pr_str = (val, printReadably) => {
  if (val instanceof MalValue) return val.pr_str(printReadably);
  if (val instanceof MalFunction) return "#<function>";
  return val.toString();
};

const isEqual = (a, b) => {
  if (a instanceof MalValue && b instanceof MalValue) {
    return a.equals(b);
  }
  return a === b;
};

class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str(printReadably = false) {
    return '--default Mal Value--';
  }

  equals(item) {
    return this.value === item.value;
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably = false) {
    return this.value;
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably = false) {
    if (printReadably) {
      return '"' + this.value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    }
    return this.value;
  }
}

class MalKeyword extends MalValue {
  constructor(keyword) {
    super(keyword);
  }

  pr_str(printReadably = false) {
    return ':' + this.value;
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably = false) {
    return '(atom ' + pr_str(this.value, printReadably) + ')';
  }

  deref() {
    return this.value;
  }

  reset(value) {
    this.value = value;
    return this.value;
  }

  swap(f, args) {
    this.value = f.apply(null, [this.value, ...args]);
    return this.value;
  }
}

class MalSeq extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably, startingSymbol = '(', closingSymbol = ')') {
    return startingSymbol + this.value.map(x => pr_str(x, printReadably)).join(' ') + closingSymbol;
  }

  is_empty() {
    return this.value.length === 0;
  }

  equals(item) {
    if (item instanceof MalList || item instanceof MalVector) {
      return this.value.every((x, i) => isEqual(x, item.value[i]));
    }
  }

  beginsWith(symbol) {
    return this.value.length > 0 &&
      this.value[0].value === symbol;
  }

  nth(n) {
    if (n >= this.value.length) throw 'index out of range';
    return this.value[n];
  }

  first() {
    if (this.is_empty()) return new MalNil();
    return this.value[0];
  }

  rest() {
    return new MalList(this.value.slice(1));
  }
}

class MalList extends MalSeq {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably) {
    return super.pr_str(printReadably, '(', ')');
  }
}

class MalVector extends MalSeq {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably = false) {
    return super.pr_str(printReadably, '[', ']');
  }
}

class MalHashMap extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably = false) {
    return '{' + this.value.map((x, i) => {
      if ((i % 2 != 0) && (i != this.value.length - 1)) {
        return x + ',';
      };

      if (x instanceof MalValue) return x.pr_str();
      return x;

    }).join(' ') + '}';
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  pr_str(printReadably = false) {
    return 'nil';
  }

  count() {
    return 0;
  }

  first() {
    return this;
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn, isMacro = false) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn;
    this.isMacro = isMacro;
  }

  pr_str(printReadably) {
    return '#<function>';
  }

  apply(context, args) {
    return this.fn.apply(context, args);
  }
}

const createMalString = str =>
  new MalString(str.replace(/\\(.)/g, (y, captured) => captured === 'n' ? '\n' : captured));


module.exports = { MalValue, MalSymbol, MalSeq, MalList, MalVector, MalHashMap, MalNil, MalString, MalKeyword, MalFunction, MalAtom, createMalString, pr_str };