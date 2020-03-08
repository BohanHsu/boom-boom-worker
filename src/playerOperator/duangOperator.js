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

  _currentDuangRequestId: ?string;

  _duangRequestHandled: Array<HandledDuangRequest>;

  constructor(workerMaster: WorkerMaster) {
    this._workerMaster = workerMaster;

    this._currentDuangRequestId = null;

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

    this._currentDuangRequestId = this._getNextDuangRequestIdFromMaster();

    logger.log('[duang play operator] _syncWithWorkerMaster current requestId', this._currentDuangRequestId);

    if (this._currentDuangRequestId) {
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

  _getNextDuangRequestIdFromMaster(): ?string {
    let duangRequestId = null;
    const workerMaster = this._workerMaster;
    if (workerMaster) {
      logger.log('[duang play operator] _makeSureDuang');
      duangRequestId = workerMaster.getNextDuangRequestId();
    }
    return duangRequestId;
  }

  _makeSureStopDuang(): void {
    const playerOperator = this._playerOperator;
    if (playerOperator) {
      playerOperator.stopPlay();
    }
    this._playerOperator = null;

    const handledRequestId = this._currentDuangRequestId || '';
    this._duangRequestHandled.push({
      requestId: handledRequestId, 
      duangPlayed: false, 
      rejectReason: "Duang Play interrupted by global switch",
    });
    this._currentDuangRequestId = null;
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
      const handledRequestId = this._currentDuangRequestId || '';
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

    playerOperator.startPlay();
    this._playerOperator = playerOperator;
  }

  _duangFinished(): void {
    logger.log('[duang play operator] _duangFinished', this._currentDuangRequestId);
    this._playerOperator = null;

    const handledRequestId = this._currentDuangRequestId || '';

    this._duangRequestHandled.push({
      requestId: handledRequestId, 
      duangPlayed: true, 
      rejectReason: null
    });

    this._currentDuangRequestId = null;
    logger.log('[duang play operator] _duangFinished finished', this._duangRequestHandled);
  }

}

module.exports = DuangOperator;
