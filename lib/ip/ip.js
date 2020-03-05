const ip = require('ip');

const logger = require('../logger/logger');

class Ip {
  constructor() {
    this._pollCurrentIp();
  }

  _pollCurrentIp() {
    this._queryCurrentIp();

    this._timerId = setInterval(() => {
      this._queryCurrentIp();
    }, 3000);
  }

  _queryCurrentIp() {
    this._ipAddress = ip.address();
    logger.log('[Ip queryCurrentIp] latest IP value: ', this._ipAddress);
  }

  getCurrentIp() {
    return this._ipAddress;
  }

}

module.exports = Ip;