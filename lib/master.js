const HttpsMessenger = require('./messenger/httpsMessenger');

const Ip = require('./ip/ip');

const ShouldPlayOperator = require('./playerOperator/shouldPlayOperator');

const DuangOperator = require('./playerOperator/duangOperator');

const logger = require('./logger/logger');

const defaultConfigs = require('./configs/defaultConfigs');

class WorkerMaster {
  constructor(messenger, mp3FilePath) {
    this._globalSwitch = false;
    this._shouldPlay = false;
    this._duangRequestQueue = [];
    this._syncSuccessFinishTime = -1;
    this._messenger = messenger;
    this._mp3FilePath = mp3FilePath;
    this._ip = new Ip();

    this._keepSyncWithControlTower();

    this._startOperator();

    this._startDuangOperator();
  }

  getGlobalSwitch() {
    return this._globalSwitch;
  }

  getShouldPlay() {
    return this._globalSwitch && this._shouldPlay;
  }

  getNextDuangRequestId() {
    if (this._duangRequestQueue.length > 0) {
      return this._duangRequestQueue.shift();
    }

    return null;
  }

  getDuangPlayerOperatorConfig() {
    return defaultConfigs.duang;
  }

  getShouldPlayPlayerOperatorConfig() {
    return defaultConfigs.shouldPlay;
  }

  _startOperator() {
    if (this._shouldPlayOperator == null) {
      logger.log('[master _startShouldPlayOperator]', this._mp3FilePath);
      this._shouldPlayOperator = new ShouldPlayOperator(this);
    }
  }

  _startDuangOperator() {
    if (this._duangOperator == null) {
      logger.log('[master _startDuangOperator]', this._mp3FilePath);
      this._duangOperator = new DuangOperator(this);
    }
  }

  _getIsPlayingForAllOperators() {
    return !!(this._shouldPlayOperator && this._shouldPlayOperator.isPlaying()) || !!(this._duangOperator && this._duangOperator.isPlaying());
  }

  _syncWithControlTower() {
    const currentTimestamp = Math.floor(new Date() / 1); // safety check

    if (this._syncSuccessFinishTime > 0 && currentTimestamp - this._syncSuccessFinishTime > 20000) {
      logger.log('triggered safety trap, set shouldPlay to false temporarily');
      this._shouldPlay = false;
      this._duangRequestQueue = [];
    }

    logger.log('WorkerMaster sync with control tower, timestamp', currentTimestamp);

    const isPlaying = this._getIsPlayingForAllOperators();

    let outMessage = {
      isPlaying
    };

    const ipAddress = this._ip.getCurrentIp();

    logger.log('[WorkerMaster get current IP]', ipAddress);

    if (ipAddress) {
      outMessage.ip = ipAddress;
    }

    let nextHandledDuangRequest = null;
    const duangOperator = this._duangOperator;

    if (duangOperator) {
      nextHandledDuangRequest = duangOperator.getNextHandledRequest();
    }

    if (nextHandledDuangRequest) {
      outMessage.duang = nextHandledDuangRequest;
    }

    this._messenger.ping(outMessage, inMessage => {
      if (inMessage.httpCode !== 200) {
        this._shouldPlay = false;
        this._duangRequestQueue = [];
      }

      this._syncSuccessFinishTime = Math.floor(new Date() / 1);
      this._globalSwitch = inMessage.globalSwitch;
      this._shouldPlay = !!inMessage.shouldPlay;

      if (inMessage.duang) {
        this._duangRequestQueue.push(inMessage.duang);
      }

      logger.log('WorkerMaster sync finish, shouldPlay', this._shouldPlay, this._duangRequestQueue);
    });
  }

  _keepSyncWithControlTower() {
    this._syncWithControlTower();

    let timer = setInterval(() => {
      this._syncWithControlTower();
    }, 3000);
  }

}

module.exports = WorkerMaster;