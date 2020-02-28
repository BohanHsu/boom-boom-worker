const HttpsMessenger = require('./messenger/httpsMessenger'); // const Mp3 = require('./mp3/mp3');


const Operator = require('./playerOperator/operator');

class WorkerMaster {
  constructor(messenger, mp3FilePath) {
    this._shouldPlay = false;
    this._syncSuccessFinishTime = -1;
    this._messenger = messenger;
    console.log("xbh3", mp3FilePath);
    this._mp3FilePath = mp3FilePath;
    this.keepSyncWithControlTower();
    console.log('xbh1');

    this._startOperator();
  }

  _startOperator() {
    console.log("xbh2", this._playerOperator);

    if (this._playerOperator == null) {
      console.log('[master _startOperator]', this._mp3FilePath);
      this._playerOperator = new Operator(this._mp3FilePath, this);
    }
  }

  getShouldPlay() {
    return this._shouldPlay;
  }

  syncWithControlTower() {
    const currentTimestamp = Math.floor(new Date() / 1); // safety check

    if (this._syncSuccessFinishTime > 0 && currentTimestamp - this._syncSuccessFinishTime > 20000) {
      console.log('triggered safety trap, set shouldPlay to false temporarily');
      this._shouldPlay = false;
    }

    console.log('WorkerMaster sync with control tower, timestamp', currentTimestamp);
    const isPlaying = !!(this._playerOperator && this._playerOperator.isPlaying());

    this._messenger.syncHttps({
      isPlaying
    }, outMessage => {
      if (outMessage.httpCode !== 200) {
        this._shouldPlay = false;
      }

      this._syncSuccessFinishTime = Math.floor(new Date() / 1);
      this._shouldPlay = !!outMessage.shouldPlay;
      console.log('WorkerMaster sync finish, shouldPlay', this._shouldPlay);
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