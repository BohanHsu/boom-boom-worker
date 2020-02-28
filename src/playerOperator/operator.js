// @flow

const Mp3 = require('../mp3/mp3');
const Player = require('../mp3/player');
const PlayerController = require('../mp3/playerController');
const WorkerMaster = require('../master');

class Operator {
  _mp3FilePath: string;
  _playerController: ?PlayerController;
  _workerMaster: WorkerMaster;

  _isPlaying: boolean;
  _nextPlayDelayMS: number;
  _intermittentPlayTimeout: ?any;

  constructor(mp3FilePath: string, workerMaster: WorkerMaster) {
    this._mp3FilePath = mp3FilePath;
    this._playerController = null;

    this._isPlaying = false;
    this._nextPlayDelayMS = 0;
    this._intermittentPlayTimeout = null;

    this._workerMaster = workerMaster;
    this._keepSyncWithMaster();
  }

  isPlaying(): boolean {
    return this._isPlaying;
  }

  _keepSyncWithMaster() {
    console.log('[should play operator] _keepSyncWithMaster');
    this._syncWithWorkerMaster();
    let timer = setInterval(() => {
      this._syncWithWorkerMaster();
    }, 1000);
  }

  _syncWithWorkerMaster() {
    const shouldPlay = this._workerMaster.getShouldPlay();

    console.log('[should play operator] _syncWithWorkerMaster: shouldPlay: ', shouldPlay);

    if (shouldPlay) {
      this._makeSurePlay();
    } else {
      this._makeSureNotPlay();
    }
  }

  _makeSurePlay() {
    console.log('[should play operator] _makeSurePlay');
    if (this._playerController && this._playerController.isPlaying()) {
      console.log('[should play operator] _makeSurePlay early return 1');
      return;
    }

    if (this._intermittentPlayTimeout != null) {
      console.log('[should play operator] _makeSurePlay early return 2');
      return;
    }

    console.log('[should play operator] _makeSurePlay before _intermittentPlay');
    this._intermittentPlay();
  }

  _makeSureNotPlay() {
    if (this._intermittentPlayTimeout != null) {
      clearTimeout(this._intermittentPlayTimeout);
      this._intermittentPlayTimeout = null;
    }

    if (this._playerController && this._playerController.isPlaying()) {
      this._playerController.stopPlayer();
    }

    if (this._playerController && !this._playerController.isPlaying()) {
      this._playerController = null;
    }

    this._isPlaying = false;
    this._nextPlayDelayMS = 0;
  }

  _intermittentPlay() {
    console.log('[should play operator] _intermittentPlay');

    this._isPlaying = true;
    if (this._nextPlayDelayMS === 0) {
      this._singleShootOfPlay();
    }

    if (this._nextPlayDelayMS > 0) {
      console.log('[should play operator] wait for delay:', this._nextPlayDelayMS);
      this._intermittentPlayTimeout = setTimeout(() => {
        clearTimeout(this._intermittentPlayTimeout);
        this._intermittentPlayTimeout = null;
        this._singleShootOfPlay();
      }, this._nextPlayDelayMS);
    }

    this._nextPlayDelayMS = 10000;
  }

  _singleShootOfPlay() {
    console.log('[should play operator] _singleShootOfPlay');
    const mp3s = [new Mp3(this._mp3FilePath)];

    this._playerController = new PlayerController();

    const player = new Player(this._playerController, mp3s);

    this._isPlaying = true;
    this._playerController.startPlayer();
  }
}

module.exports = Operator;
