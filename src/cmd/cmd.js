// @flow

const {exec} = require('child_process');

function CMD(command: string, cb: (e: any, stdout: any) => void): void {
  exec(command, (e, stdout) => {
    cb(e, stdout);
  }
}

module.exports = {
  CMD,
};
