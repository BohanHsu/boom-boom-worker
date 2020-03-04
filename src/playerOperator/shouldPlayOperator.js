// @flow

const Mp3 = require('../mp3/mp3');
const WorkerMaster = require('../master');
const PlayerOperator = require('./playerOperator');

class ShouldPlayOperator {
  _mp3FilePath: string;
  _workerMaster: WorkerMaster;

  _playerOperator: ?PlayerOperator;

  constructor(mp3FilePath: string, workerMaster: WorkerMaster) {
    this._mp3FilePath = mp3FilePath;

    this._playerOperator = null;

    this._workerMaster = workerMaster;
    this._keepSyncWithMaster();
  }

  isPlaying(): boolean {
    const playerOperator = this._playerOperator;
    if (!playerOperator) {
      return false;
    }
    return playerOperator.isPlaying();
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
    let playerOperator = this._playerOperator;
    if (playerOperator && playerOperator.isPlaying()) {
      return;
    }

    if (playerOperator) {
      playerOperator.stopPlay();
      playerOperator = null;
    }

    playerOperator = new PlayerOperator(
      [this._mp3FilePath],
      true,
      -1,
      -1,
      1000,
      10000,
      null,
    );
    playerOperator.startPlay();
    this._playerOperator = playerOperator;
  }

  _makeSureNotPlay() {
    let playerOperator = this._playerOperator;
    if (playerOperator) {
      playerOperator.stopPlay();
    }
  }
}

module.exports = ShouldPlayOperator;
