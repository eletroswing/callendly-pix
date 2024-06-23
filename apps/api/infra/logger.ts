const { log } = console;

function wrapper(fn: Function): Function {
  return (...args: any) => {
    const startTime = new Date().toISOString();
    console.log(args)
    return fn(`[${startTime}] `, ...args);
  };
}

export default Object.freeze({
  log: wrapper(log),
});
