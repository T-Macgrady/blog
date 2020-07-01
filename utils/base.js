export function beforeFn(fn, inject) {
  return (...args) => {
    try {
      inject(...args);
      fn.call(this, ...args);
    } catch (error) {
      console.warn(error);
      fn.call(this, ...args);
    }
  };
}
export function afterFn(fn, inject) {
  return (...args) => {
    try {
      fn.call(this, ...args);
      inject(...args);
    } catch (error) {
      console.warn(error);
      fn.call(this, ...args);
    }
  };
}
