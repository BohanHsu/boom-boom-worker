// @flow

const HttpsMessenger = require('./messenger/httpsMessenger');
const Operator = require('./playerOperator/operator');
const DuangOperator = require('./playerOperator/duangOperator');

import type {HandledDuangRequest} from './playerOperator/duangOperator';
import type {InMessageType, OutMessageType} from './messenger/messageTypes';

class WorkerMaster {
  _globalSwitch: boolean;
  _shouldPlay: boolean;
  _duangRequestQueue: Array<string>;
  _syncSuccessFinishTime: number;

  _messenger: HttpsMessenger;
  _mp3FilePath: string;

  _playerOperator: ?Operator;
  _duangOperator: ?DuangOperator;

  constructor(messenger: HttpsMessenger, mp3FilePath: string) {
    this._globalSwitch = false;
    this._shouldPlay = false;
    this._duangRequestQueue = [];

    this._syncSuccessFinishTime = -1;

    this._messenger = messenger;
    this._mp3FilePath = mp3FilePath;

    this.keepSyncWithControlTower();
    this._startOperator();

    this._startDuangOperator();
  }

  _startOperator(): void {
    if (this._playerOperator == null) {
      console.log('[master _startOperator]', this._mp3FilePath);
      this._playerOperator = new Operator(this._mp3FilePath, this);
    }
  }

  _startDuangOperator(): void {
    if (this._duangOperator == null) {
      console.log('[master _startDuangOperator]', this._mp3FilePath);
      this._duangOperator = new DuangOperator(this._mp3FilePath, this);
    }
  }

  getGlobalSwitch(): boolean {
    return this._globalSwitch;
  }

  getShouldPlay(): boolean {
    return this._globalSwitch && this._shouldPlay;
  }

  getNextDuangRequestId(): ?string {
    if (this._duangRequestQueue.length > 0) {
      return this._duangRequestQueue.shift();
    }

    return null;
  }

  syncWithControlTower(): void {
    const currentTimestamp = Math.floor(new Date() / 1);

    // safety check
    if (this._syncSuccessFinishTime > 0 && currentTimestamp - this._syncSuccessFinishTime > 20000) {
      console.log('triggered safety trap, set shouldPlay to false temporarily');
      this._shouldPlay = false;
      this._duangRequestQueue = [];
    }

    console.log('WorkerMaster sync with control tower, timestamp', currentTimestamp);

    const isPlaying = !!(this._playerOperator && this._playerOperator.isPlaying());

    let outMessage:OutMessageType = {isPlaying};


    let nextHandledDuangRequest: ?HandledDuangRequest = null;
    const duangOperator = this._duangOperator;
    if (duangOperator) {
      nextHandledDuangRequest = duangOperator.getNextHandledRequest();
    }

    if (nextHandledDuangRequest) {
      outMessage.duang = nextHandledDuangRequest;
    }

    this._messenger.syncHttps(outMessage, (inMessage) => {
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

  keepSyncWithControlTower(): void {
    this.syncWithControlTower();
    let timer = setInterval(() => {
      this.syncWithControlTower();
    }, 3000);
  }
}

module.exports = WorkerMaster;
