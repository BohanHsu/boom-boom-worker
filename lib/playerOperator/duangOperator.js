const Mp3 = require('../mp3/mp3');

const Player = require('../mp3/player'); // const PlayerController = require('../mp3/playerController');


const WorkerMaster = require('../master');

const PlayerOperator = require('./playerOperator');

class DuangOperator {
  // _playerController: ?PlayerController;
  constructor(mp3FilePath, workerMaster) {
    this._mp3FilePath = mp3FilePath;
    this._workerMaster = workerMaster; // this._playerController = null;

    this._currentDuangRequestId = null;
    this._duangRequestHandled = [];

    this._keepSyncWithMaster();
  }

  isPlaying() {
    const playerOperator = this._playerOperator;

    if (playerOperator) {
      return playerOperator.isPlaying();
    }

    return false;
  }

  getNextHandledRequest() {
    if (this._duangRequestHandled.length > 0) {
      return this._duangRequestHandled.shift();
    }

    return null;
  }

  _keepSyncWithMaster() {
    console.log('[duang play operator] _keepSyncWithMaster');

    this._syncWithWorkerMaster();

    let timer = setInterval(() => {
      this._syncWithWorkerMaster();
    }, 1000);
  }

  _syncWithWorkerMaster() {
    console.log('[duang play operator] _syncWithWorkerMaster');

    const globalSwitch = this._getGlobalSwitch(); // if (this._playerController && this._playerController.isPlaying()) {
    //


    const playerOperator = this._playerOperator;

    if (playerOperator && playerOperator.isPlaying()) {
      if (!globalSwitch) {
        console.log('[duang play operator] _syncWithWorkerMaster: force stop duang');

        this._makeSureStopDuang();
      }

      console.log('[duang play operator] _syncWithWorkerMaster: isplaying early return 1');
      return;
    }

    this._currentDuangRequestId = this._getNextDuangRequestIdFromMaster();
    console.log('[duang play operator] _syncWithWorkerMaster current requestId', this._currentDuangRequestId);

    if (this._currentDuangRequestId) {
      this._makeSureDuang();
    }
  }

  _getGlobalSwitch() {
    const workerMaster = this._workerMaster;

    if (workerMaster) {
      return workerMaster.getGlobalSwitch();
    }

    return false;
  }

  _getNextDuangRequestIdFromMaster() {
    let duangRequestId = null;
    const workerMaster = this._workerMaster;

    if (workerMaster) {
      console.log('[duang play operator] _makeSureDuang');
      duangRequestId = workerMaster.getNextDuangRequestId();
    }

    return duangRequestId;
  }

  _makeSureStopDuang() {
    // const playerController = this._playerController;
    // if (playerController) {
    //   playerController.stopPlayer();
    // }
    const playerOperator = this._playerOperator;

    if (playerOperator) {
      playerOperator.stopPlay();
    }

    this._playerOperator = null;
    const handledRequestId = this._currentDuangRequestId || '';

    this._duangRequestHandled.push({
      requestId: handledRequestId,
      duangPlayed: false,
      rejectReason: "Duang Play interrupted by global switch"
    }); // this._playerController = null;


    this._currentDuangRequestId = null;
  }

  _makeSureDuang() {
    console.log('[duang play operator] _makeSureDuang'); // if (this._playerController && this._playerController.isPlaying()) {
    //   // already playing
    //   console.log('[duang play operator] _makeSureDuang already playing');
    //   return;
    // }

    const playerOperator = this._playerOperator;

    if (playerOperator && playerOperator.isPlaying()) {
      // already playing
      console.log('[duang play operator] _makeSureDuang already playing');
      return;
    }

    this._duang();
  }

  _duang() {
    console.log('[duang play operator] _duang'); // const mp3s = [new Mp3(this._mp3FilePath)];
    // const playerController = new PlayerController();
    // playerController.setPlayerFinishCallback(() => {this._duangFinished()});
    // const player = new Player(playerController, mp3s);
    // playerController.startPlayer();
    // this._playerController = playerController;

    const mp3s = [this._mp3FilePath];
    const playerOperator = new PlayerOperator(mp3s, false, 1, 3, 1000, 3000, () => {
      this._duangFinished();
    });
    playerOperator.startPlay();
    this._playerOperator = playerOperator;
  }

  _duangFinished() {
    console.log('[duang play operator] _duangFinished', this._currentDuangRequestId); // this._playerController = null;

    this._playerOperator = null;
    const handledRequestId = this._currentDuangRequestId || '';

    this._duangRequestHandled.push({
      requestId: handledRequestId,
      duangPlayed: true,
      rejectReason: null
    });

    this._currentDuangRequestId = null;
    console.log('[duang play operator] _duangFinished finished', this._duangRequestHandled);
  }

}

module.exports = DuangOperator;