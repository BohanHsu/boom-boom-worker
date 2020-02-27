const HttpsMessenger = require('./messenger/httpsMessenger'); // const Mp3 = require('./mp3/mp3');


class WorkerMaster {
  constructor(messenger) {
    this._shouldPlay = false;
    this._syncSuccessFinishTime = -1;
    this._messenger = messenger;
    this.keepSyncWithControlTower();
  }

  syncWithControlTower() {
    const currentTimestamp = Math.floor(new Date() / 1); // safety check

    if (this._syncSuccessFinishTime > 0 && currentTimestamp - this._syncSuccessFinishTime > 20000) {
      console.log('triggered safety trap, set shouldPlay to false temporarily');
      this._shouldPlay = false;
    }

    console.log('WorkerMaster sync with control tower, timestamp', currentTimestamp); // _syncSuccessFinishTime = currentTimestamp;

    this._messenger.syncHttps({
      isPlaying: false
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

module.exports = WorkerMaster; // const Mp3 = require('./mp3/mp3');
// const Player = require('./mp3/player');
// const PlayerController = require('./mp3/playerController');
// 
// const mp3s = [new Mp3(`/Users/bohanxu/Downloads/short.mp3`),
//   new Mp3(`/Users/bohanxu/Downloads/short.mp3`),
//   //new Mp3(`/Users/bohanxu/Downloads/short.mp3`),
//   //new Mp3(`/Users/bohanxu/Downloads/short.mp3`), 
//   /*new Mp3(`/Users/bohanxu/Downloads/short.mp3`)*/];
// 
// 
// const playerController = new PlayerController();
// 
// const player = new Player(playerController, mp3s);
// 
// playerController.startPlayer();
// 
// setTimeout(() => {
//   playerController.stopPlayer();
// }, 10000);