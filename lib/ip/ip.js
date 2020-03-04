const ip = require('ip');

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
    console.log('[Ip queryCurrentIp] latest IP value: ', this._ipAddress);
  }

  getCurrentIp() {
    return this._ipAddress;
  }

}

module.exports = Ip;