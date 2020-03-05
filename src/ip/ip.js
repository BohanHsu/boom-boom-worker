// @flow
const ip = require('ip');

const logger = require('../logger/logger');

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
    logger.log('[Ip queryCurrentIp] latest IP value: ', this._ipAddress);
  }

  getCurrentIp(): ?string {
    return this._ipAddress;
  }

}

module.exports = Ip;
