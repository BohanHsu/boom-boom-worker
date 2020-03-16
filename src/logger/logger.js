module.exports = {
  log: function(...args) {
    if (process.env.DEV_LOG) {
      console.log(...args);
    }
  },

  error: function(...args) {
    if (process.env.DEV_LOG) {
      console.log(...args);
    }
  },
};
