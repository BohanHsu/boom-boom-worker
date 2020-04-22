const {
  exec
} = require('child_process');

function CMD(command, cb) {
  exec(command, (e, stdout) => {
    cb(e, stdout);
  });
}

module.exports = {
  CMD
};