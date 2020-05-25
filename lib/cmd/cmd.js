const {
  exec,
  spawn
} = require('child_process');

function CMD_SPAWN(command, cb) {
  const child = spawn(command, [], {
    detached: true,
    stdio: ['ignore']
  }).unref();
}

module.exports = {
  CMD_SPAWN
};