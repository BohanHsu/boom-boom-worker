// @flow

const {CMD_SPAWN} = require('./cmd');

function executeCommand(commands) {
  executeOneCommand(commands, 0);
}

function executeOneCommand(commands, i) {
  if (i >= commands.length) {
    return;
  }

  CMD_SPAWN(commands[i], (e, stdout) => {
    executeOneCommand(commands, i + 1);
  });
}

module.exports = {
  executeCommand,
};
