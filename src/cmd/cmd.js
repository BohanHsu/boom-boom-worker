// @flow

const {exec, spawn} = require('child_process');

function CMD_SPAWN(command: string, cb: (e: any, stdout: any) => void): void {
  const child = spawn(command, [], {
        detached: true,
        stdio: ['ignore']
  }).unref();
}

module.exports = {
  CMD_SPAWN,
};
