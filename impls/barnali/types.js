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

  pr_str() {
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
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '\"' + this.value + '\"';
  }
}

class MalKeyword extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
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

  pr_str() {
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

  pr_str() {
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

  pr_str() {
    return 'nil';
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env) {
    super(ast);
    this.binds = binds;
    this.env = env;
  }

  pr_str() {
    return '#<function>';
  }
}


module.exports = { MalValue, MalSymbol, MalList, MalVector, MalHashMap, MalNil, MalString, MalKeyword, MalFunction };