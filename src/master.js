// @flow

const HttpsMessenger = require('./messenger/httpsMessenger');
const Ip = require('./ip/ip');
const ShouldPlayOperator = require('./playerOperator/shouldPlayOperator');
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

  _shouldPlayOperator: ?ShouldPlayOperator;
  _duangOperator: ?DuangOperator;
  _ip: Ip;

  constructor(messenger: HttpsMessenger, mp3FilePath: string) {
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



  _startOperator(): void {
    if (this._shouldPlayOperator == null) {
      console.log('[master _startShouldPlayOperator]', this._mp3FilePath);
      this._shouldPlayOperator = new ShouldPlayOperator(this._mp3FilePath, this);
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

  _getIsPlayingForAllOperators(): boolean {
    return !!(this._shouldPlayOperator && this._shouldPlayOperator.isPlaying()) || 
      !!(this._duangOperator && this._duangOperator.isPlaying());
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

    const isPlaying = this._getIsPlayingForAllOperators();

    let outMessage:OutMessageType = {isPlaying};

    const ipAddress = this._ip.getCurrentIp();
    console.log('[WorkerMaster get current IP]', ipAddress);

    if (ipAddress) {
      outMessage.ip = ipAddress;
    }

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
