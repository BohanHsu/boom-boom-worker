// @flow

const Mp3 = require('../mp3/mp3');
const Player = require('../mp3/player');
const WorkerMaster = require('../master');
const PlayerOperator = require('./playerOperator');

const logger = require('../logger/logger');

export type HandledDuangRequest = {
  requestId: string,
  duangPlayed: boolean,
  rejectReason: ?string
};

class DuangOperator {
  _playerOperator: ?PlayerOperator;
  _workerMaster: WorkerMaster;

  _currentDuangRequestIdAndOptionalMp3File: ?{requestId: string, optionalMp3File?: string};

  _duangRequestHandled: Array<HandledDuangRequest>;

  constructor(workerMaster: WorkerMaster) {
    this._workerMaster = workerMaster;

    this._currentDuangRequestIdAndOptionalMp3File = null;

    this._duangRequestHandled = [];
    this._keepSyncWithMaster();
  }

  isPlaying(): boolean {
    const playerOperator = this._playerOperator;
    if (playerOperator) {
      return playerOperator.isPlaying();
    }

    return false;
  }

  getNextHandledRequest(): ?HandledDuangRequest {
    if (this._duangRequestHandled.length > 0) {
      return this._duangRequestHandled.shift();
    }
    return null;
  }

  peekNextHandledRequest(): ?HandledDuangRequest {
    if (this._duangRequestHandled.length > 0) {
      return this._duangRequestHandled[0];
    }

    return null;
  }

  _keepSyncWithMaster() {
    logger.log('[duang play operator] _keepSyncWithMaster');
    this._syncWithWorkerMaster();

    let timer = setInterval(() => {
      this._syncWithWorkerMaster();
    }, 1000);
  }

  _syncWithWorkerMaster(): void {
    logger.log('[duang play operator] _syncWithWorkerMaster');

    const globalSwitch = this._getGlobalSwitch();

    const playerOperator = this._playerOperator;
    if (playerOperator && playerOperator.isPlaying()) {

      if (!globalSwitch) {
        logger.log('[duang play operator] _syncWithWorkerMaster: force stop duang');
        this._makeSureStopDuang();
      }

      logger.log('[duang play operator] _syncWithWorkerMaster: isplaying early return 1');
      return;
    }

    this._currentDuangRequestIdAndOptionalMp3File = this._getNextDuangRequestIdAndOptionalMp3FileFromMaster();

    logger.log('[duang play operator] _syncWithWorkerMaster current requestId', this._currentDuangRequestIdAndOptionalMp3File);

    if (this._currentDuangRequestIdAndOptionalMp3File) {
      this._makeSureDuang();
    }
  }

  _getGlobalSwitch(): boolean {
    const workerMaster = this._workerMaster;
    if (workerMaster) {
      return workerMaster.getGlobalSwitch();
    }

    return false;
  }

  _getNextDuangRequestIdAndOptionalMp3FileFromMaster(): ?{requestId: string, optionalMp3File?: string} {
    let duangRequestIdAndOptionalMp3File = null;
    const workerMaster = this._workerMaster;
    if (workerMaster) {
      logger.log('[duang play operator] _getNextDuangRequestIdFromMaster');
      duangRequestIdAndOptionalMp3File = workerMaster.getNextDuangRequestIdAndOptionalMp3File();
    }
    return duangRequestIdAndOptionalMp3File;
  }

  _makeSureStopDuang(): void {
    const playerOperator = this._playerOperator;
    if (playerOperator) {
      playerOperator.stopPlay();
    }
    this._playerOperator = null;

    let handledRequestId = '';
    if (this._currentDuangRequestIdAndOptionalMp3File) {
      this._currentDuangRequestIdAndOptionalMp3File.requestId;
    }

    this._duangRequestHandled.push({
      requestId: handledRequestId, 
      duangPlayed: false, 
      rejectReason: "Duang Play interrupted by global switch",
    });
    this._currentDuangRequestIdAndOptionalMp3File = null;
  }


  _makeSureDuang(): void {
    logger.log('[duang play operator] _makeSureDuang');
    const playerOperator = this._playerOperator;
    if (playerOperator && playerOperator.isPlaying()) {
      // already playing
      logger.log('[duang play operator] _makeSureDuang already playing');
      return;
    }

    this._duang();
  }

  _duang(): void {
    logger.log('[duang play operator] _duang');
    const config = this._workerMaster.getDuangPlayerOperatorConfig();

    if (config.mp3Files.length === 0) {

      let handledRequestId = '';
      if (this._currentDuangRequestIdAndOptionalMp3File) {
        handledRequestId = this._currentDuangRequestIdAndOptionalMp3File.requestId;
      }

      this._duangRequestHandled.push({
        requestId: handledRequestId, 
        duangPlayed: false, 
        rejectReason: "No mp3 files to Duang",
      });
      logger.log('[duang play operator] cannot play due to no mp3 files provided.');
      return;
    }

    const playerOperator = new PlayerOperator(
      config,
      () => {
        this._duangFinished();
      },
    );

    let optionalMp3File = null;

    if (this._currentDuangRequestIdAndOptionalMp3File) {
      optionalMp3File = this._currentDuangRequestIdAndOptionalMp3File.optionalMp3File;
    }

    playerOperator.startPlay(optionalMp3File);

    this._playerOperator = playerOperator;
  }

  _duangFinished(): void {
    logger.log('[duang play operator] _duangFinished', this._currentDuangRequestIdAndOptionalMp3File);
    this._playerOperator = null;

    let handledRequestId = '';
    if (this._currentDuangRequestIdAndOptionalMp3File) {
      handledRequestId = this._currentDuangRequestIdAndOptionalMp3File.requestId;
    }

    this._duangRequestHandled.push({
      requestId: handledRequestId, 
      duangPlayed: true, 
      rejectReason: null
    });

    this._currentDuangRequestIdAndOptionalMp3File = null;
    logger.log('[duang play operator] _duangFinished finished', this._duangRequestHandled);
  }

}

module.exports = DuangOperator;
