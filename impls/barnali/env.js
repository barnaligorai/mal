const { MalList } = require("./types");

class Env {
  #outer;
  #binds;
  #exprs;

  constructor(outer, binds, exprs) {
    this.#outer = outer;
    this.data = {};
    this.#binds = binds;
    this.#exprs = exprs;
    this.#setBindings();
  }

  #setBindings() {
    if (this.#binds) {
      let index = 0;
      while (index < this.#binds.value.length) {

        if (this.#binds.value[index].value === '&') {
          this.set(this.#binds.value[index + 1], new MalList(this.#exprs.slice(index)));
          return;
        }

        this.set(this.#binds.value[index], this.#exprs[index]);
        index++;
      }
    }
  }

  set(symbol, malValue) {
    this.data[symbol.value] = malValue;
  }

  find(symbol) {
    if (this.data[symbol.value] !== undefined) {
      return this;
    }
    if (this.#outer) {
      return this.#outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol);
    if (!env) throw `${symbol.value} not found`;
    return env.data[symbol.value];
  }
}

module.exports = { Env };