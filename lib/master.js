const HttpsMessenger = require('./messenger/httpsMessenger');

const Ip = require('./ip/ip');

const Operator = require('./playerOperator/operator');

const DuangOperator = require('./playerOperator/duangOperator');

class WorkerMaster {
  constructor(messenger, mp3FilePath) {
    this._globalSwitch = false;
    this._shouldPlay = false;
    this._duangRequestQueue = [];
    this._syncSuccessFinishTime = -1;
    this._messenger = messenger;
    this._mp3FilePath = mp3FilePath;
    this._ip = new Ip();
    this.keepSyncWithControlTower();

    this._startOperator();

    this._startDuangOperator();
  }

  _startOperator() {
    if (this._playerOperator == null) {
      console.log('[master _startOperator]', this._mp3FilePath);
      this._playerOperator = new Operator(this._mp3FilePath, this);
    }
  }

  _startDuangOperator() {
    if (this._duangOperator == null) {
      console.log('[master _startDuangOperator]', this._mp3FilePath);
      this._duangOperator = new DuangOperator(this._mp3FilePath, this);
    }
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

  syncWithControlTower() {
    const currentTimestamp = Math.floor(new Date() / 1); // safety check

    if (this._syncSuccessFinishTime > 0 && currentTimestamp - this._syncSuccessFinishTime > 20000) {
      console.log('triggered safety trap, set shouldPlay to false temporarily');
      this._shouldPlay = false;
      this._duangRequestQueue = [];
    }

    console.log('WorkerMaster sync with control tower, timestamp', currentTimestamp);
    const isPlaying = !!(this._playerOperator && this._playerOperator.isPlaying());
    let outMessage = {
      isPlaying
    };

    const ipAddress = this._ip.getCurrentIp();

    console.log('[WorkerMaster get current IP]', ipAddress);

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

    this._messenger.syncHttps(outMessage, inMessage => {
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

      console.log('WorkerMaster sync finish, shouldPlay', this._shouldPlay, this._duangRequestQueue);
    });
  }

  keepSyncWithControlTower() {
    this.syncWithControlTower();
    let timer = setInterval(() => {
      this.syncWithControlTower();
    }, 3000);
  }

}

module.exports = WorkerMaster;