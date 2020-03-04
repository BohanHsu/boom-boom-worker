// @flow
const ip = require('ip');

class Ip {
  _ipAddress: ?string;
  _timerId: ?any;

  constructor() {
    this._pollCurrentIp();
  }

  _pollCurrentIp(): void {
    this._queryCurrentIp();

    this._timerId = setInterval(() => {
      this._queryCurrentIp();

    }, 3000);
  }

  _queryCurrentIp(): void {
    this._ipAddress = ip.address();
    console.log('[Ip queryCurrentIp] latest IP value: ', this._ipAddress);
  }

  getCurrentIp(): ?string {
    return this._ipAddress;
  }

}

module.exports = Ip;
