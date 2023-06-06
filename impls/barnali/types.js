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
    return this.value.toString();
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
    return "(atom " + pr_str(this.value, printReadably) + ")";
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

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably = false) {
    return '(' + this.value.map(x => {
      if (x instanceof MalValue) {
        return x.pr_str();
      }
      return x;
    }).join(' ') + ')';
  }

  is_empty() {
    return this.value.length === 0;
  }

  equals(item) {
    if (item instanceof MalList || item instanceof MalVector) {
      return this.value.every((x, i) => isEqual(x, item.value[i]));
    }
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably = false) {
    return '[' + this.value.map(x => {
      if (x instanceof MalValue) {
        return x.pr_str();
      }
      return x;
    }).join(' ') + ']';
  }

  equals(item) {
    if (item instanceof MalList || item instanceof MalVector) {
      return this.value.every((x, i) => isEqual(x, item.value[i]));
    }
  }
}

class MalHashMap extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably = false) {
    return '{' + this.value.map((x, i) => {
      if ((i % 2 != 0) && (i != this.value.length - 1)) {
        return x + ",";
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
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn;
  }

  pr_str(printReadably = false) {
    return '#<function>';
  }

  apply(context, args) {
    return this.fn.apply(context, args);
  }
}

const createMalString = str =>
  new MalString(str.replace(/\\(.)/g, (y, captured) => captured === 'n' ? '\n' : captured));

const pr_str = (val, print_readably = false) => {
  if (val instanceof MalValue) {
    return val.pr_str(print_readably);
  }

  if (val instanceof MalFunction) {
    return "#<function>";
  }
  return val.toString();
}

module.exports = { MalValue, MalSymbol, MalList, MalVector, MalHashMap, MalNil, MalString, MalKeyword, MalFunction, MalAtom, createMalString, pr_str };