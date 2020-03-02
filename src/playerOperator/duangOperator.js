// @flow

const Mp3 = require('../mp3/mp3');
const Player = require('../mp3/player');
const PlayerController = require('../mp3/playerController');
const WorkerMaster = require('../master');

export type HandledDuangRequest = {
  requestId: string,
  duangPlayed: boolean,
  rejectReason: ?string
};

class DuangOperator {
  _mp3FilePath: string;
  _playerController: ?PlayerController;
  _workerMaster: WorkerMaster;

  _currentDuangRequestId: ?string;

  _duangRequestHandled: Array<HandledDuangRequest>;

  constructor(mp3FilePath: string, workerMaster: WorkerMaster) {
    this._mp3FilePath = mp3FilePath;
    this._workerMaster = workerMaster;
    this._playerController = null;

    this._currentDuangRequestId = null;

    this._duangRequestHandled = [];
    this._keepSyncWithMaster();
  }

  getNextHandledRequest(): ?HandledDuangRequest {
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

  _syncWithWorkerMaster(): void {
    console.log('[duang play operator] _syncWithWorkerMaster');
    if (this._playerController && this._playerController.isPlaying()) {
      console.log('[duang play operator] _syncWithWorkerMaster: isplaying early return 1');
      return;
    }

    this._currentDuangRequestId = this._getNextDuangRequestIdFromMaster();

    console.log('[duang play operator] _syncWithWorkerMaster current requestId', this._currentDuangRequestId);

    if (this._currentDuangRequestId) {
      this._makeSureDuang();
    }
  }

  _getNextDuangRequestIdFromMaster(): ?string {
    let duangRequestId = null;
    const workerMaster = this._workerMaster;
    if (workerMaster) {
      console.log('[duang play operator] _makeSureDuang');
      duangRequestId = workerMaster.getNextDuangRequestId();
    }
    return duangRequestId;
  }

  _makeSureDuang(): void {
    console.log('[duang play operator] _makeSureDuang');
    if (this._playerController && this._playerController.isPlaying()) {
      // already playing
      console.log('[duang play operator] _makeSureDuang already playing');
      return;
    }

    this._duang();
  }

  _duang(): void {
    console.log('[duang play operator] _duang');
    const mp3s = [new Mp3(this._mp3FilePath)];

    const playerController = new PlayerController();
    playerController.setPlayerFinishCallback(() => {this._duangFinished()});

    const player = new Player(playerController, mp3s);

    playerController.startPlayer();
    this._playerController = playerController;
  }

  _duangFinished(): void {
    console.log('[duang play operator] _duangFinished', this._currentDuangRequestId);
    this._playerController = null;

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
