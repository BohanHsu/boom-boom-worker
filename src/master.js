// @flow

const HttpsMessenger = require('./messenger/httpsMessenger');
const Mp3Files = require('./mp3Files/mp3Files');
const Ip = require('./ip/ip');
const ShouldPlayOperator = require('./playerOperator/shouldPlayOperator');
const DuangOperator = require('./playerOperator/duangOperator');

const logger = require('./logger/logger');

const defaultConfigs = require('./configs/defaultConfigs');
const configMerger = require('./configs/configMerger');
const {CMD_SPAWN} = require('./cmd/cmd');

import type {HandledDuangRequest} from './playerOperator/duangOperator';
import type {InMessageType, OutMessageType} from './messenger/messageTypes';
import type {PlayerOperatorConfig} from './playerOperator/playerOperator';

class WorkerMaster {
  _globalSwitch: boolean;
  _shouldPlay: boolean;
  _duangRequestQueue: Array<string>;
  _syncSuccessFinishTime: number;

  _messenger: HttpsMessenger;
  _mp3Files: Mp3Files;

  _shouldPlayOperator: ?ShouldPlayOperator;
  _duangOperator: ?DuangOperator;
  _ip: Ip;

  _config: {[string]: PlayerOperatorConfig|any};
  _initialConfigReceived: boolean;

  _syncFinishCnt: number;

  constructor(messenger: HttpsMessenger, mp3Files: Mp3Files) {
    this._globalSwitch = false;
    this._shouldPlay = false;
    this._duangRequestQueue = [];

    this._syncSuccessFinishTime = -1;

    this._messenger = messenger;
    this._mp3Files = mp3Files;

    this._ip = new Ip();

    this._keepSyncWithControlTower();

    this._config = defaultConfigs;
    this._initialConfigReceived = false;

    this._syncFinishCnt = 0;
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

  getDuangPlayerOperatorConfig(): PlayerOperatorConfig {
    let config: PlayerOperatorConfig = this._config.duang;
    return config;
  }

  getShouldPlayPlayerOperatorConfig(): PlayerOperatorConfig {
    let config: PlayerOperatorConfig = this._config.shouldPlay;
    return config;
  }

  _startOperator(): void {
    if (this._shouldPlayOperator == null) {
      logger.log('[master _startShouldPlayOperator]');
      this._shouldPlayOperator = new ShouldPlayOperator(this);
    }
  }

  _startDuangOperator(): void {
    if (this._duangOperator == null) {
      logger.log('[master _startDuangOperator]');
      this._duangOperator = new DuangOperator(this);
    }
  }

  _getIsPlayingForAllOperators(): boolean {
    return !!(this._shouldPlayOperator && this._shouldPlayOperator.isPlaying()) || 
      !!(this._duangOperator && this._duangOperator.isPlaying());
  }

  _handleNewConfigArrival(newConfig: string): void {
    let newConfigObj = null;

    try {
      newConfigObj = JSON.parse(newConfig);
    } catch (e) {
    }

    if (newConfigObj) {
      logger.log('[master before merge config, old config: ]', this._config, ', new config: ', newConfigObj);
      this._config = configMerger(this._config, newConfigObj);
      logger.log('[master after merge config: ]', this._config);
      if (!this._initialConfigReceived) {
        this._initialConfigReceived = true;
      }
      this._reportConfigToControlTower();
    }
  }

  _reportConfigToControlTower(): void {
    const configStr = JSON.stringify(this._config);
    const availableMp3s = this._mp3Files.findMp3Files();

    const outMessage = {
      config: configStr,
      availableMp3s,
    };

    this._messenger.reportConfig(outMessage);
  }

  _syncWithControlTower(requireConfig: boolean): void {
    const currentTimestamp = Math.floor(new Date() / 1);

    // safety check
    if (this._syncSuccessFinishTime > 0 && currentTimestamp - this._syncSuccessFinishTime > 20000) {
      logger.log('triggered safety trap, set shouldPlay to false temporarily');
      this._shouldPlay = false;
      this._duangRequestQueue = [];
    }

    logger.log('WorkerMaster sync with control tower, timestamp', currentTimestamp);

    const isPlaying = this._getIsPlayingForAllOperators();

    let outMessage:OutMessageType = {isPlaying};

    const ipAddress = this._ip.getCurrentIp();
    logger.log('[WorkerMaster get current IP]', ipAddress);

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

    if (requireConfig) {
      outMessage.requireConfig = true;
    }

    this._messenger.ping(outMessage, (inMessage) => {
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

      if (inMessage.config) {
        this._handleNewConfigArrival(inMessage.config);

      }

      logger.log('WorkerMaster sync finish, shouldPlay', this._shouldPlay, this._duangRequestQueue);

      this._keepWorkerFresh();

      // check and start player
      this._startOperator();
      this._startDuangOperator();
    });
  }

  _keepSyncWithControlTower(): void {
    this._syncWithControlTower(true);
    let timer = setInterval(() => {
      this._syncWithControlTower(false || !this._initialConfigReceived);
    }, 3000);
  }

  _keepWorkerFresh(): void {
    this._syncFinishCnt += 1;

    if (this._config.shouldRestartWorker === true) {
      const threshold = Math.min(...[6000, this._config.restartWorkerSyncCnt]);
      if (this._syncFinishCnt > threshold) {
        if (!this._shouldPlay && this._duangRequestQueue.length === 0 && this._duangOperator.peekNextHandledRequest() === null) {
          const restartCommand = this._config.restartWorkerScript;
          if (restartCommand) {
            CMD_SPAWN(restartCommand, (e, stdout) => {});
          }
        }
      }
    }
  }

  _periodicallyRestartPi(): void {
    setTimeout(() => {
    }, 1000);
  }
}

module.exports = WorkerMaster;
