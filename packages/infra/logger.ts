const { log } = console;

function wrapper(fn: Function): Function {
  return (...args: any) => {
    const startTime = new Date().toISOString();

    return fn(`[${startTime}] [${args[0]}]`, ...args);
  };
}

export default Object.freeze({
  log: wrapper(log),
});
