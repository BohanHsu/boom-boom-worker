// @flow

const Mp3 = require('../mp3/mp3');
const Player = require('../mp3/player');
const PlayerController = require('../mp3/playerController');

const logger = require('../logger/logger');

export type PlayerOperatorConfig = {
  mp3Files: Array<string>,
  pickOneMp3OtherwisePlayAll: boolean,
  infinityLoop: boolean,
  timesToPlayLowBoundary: number,
  timesToPlayUpBoundary: number,
  timeoutLowBoundaryMS: number,
  timeoutUpBoundaryMS: number,
  volumePercentage: number,
};

class PlayerOperator {
  _mp3FilePaths: Array<string>;
  _infinityLoop: boolean;
  _timesToPlayLowBoundary: number;
  _timesToPlayUpBoundary: number; // set low and up boundary same value to have fix times to loop
  _timeoutLowBoundaryMS: number;
  _timeoutUpBoundaryMS: number; // set low and up boundary same value to have fix timeout

  _timesToPlay: number; // time to play if not infinity play

  _playerController: ?PlayerController;

  _isPlaying: boolean;

  _nextPlayTimeout: ?any;

  _playedTimes: number;

  _killSwitched: boolean;

  _finitePlayFinishedCallback: ?(() => void);

  _config: PlayerOperatorConfig;

  constructor(
    config: PlayerOperatorConfig,
    finitePlayFinishedCallback: ?(() => void),
  ) {
    this._mp3FilePaths = config.mp3Files;
    this._infinityLoop = config.infinityLoop;
    this._timesToPlayLowBoundary = config.timesToPlayLowBoundary;
    this._timesToPlayUpBoundary = config.timesToPlayUpBoundary;
    this._timeoutLowBoundaryMS = config.timeoutLowBoundaryMS;
    this._timeoutUpBoundaryMS = config.timeoutUpBoundaryMS;
    this._finitePlayFinishedCallback = finitePlayFinishedCallback;

    this._timesToPlay = this._getTimesToPlay()
    this._isPlaying = false;
    this._playedTimes = 0;
    this._killSwitched = false;

    this._config = config;

    logger.log('[PlayerOperator] construct: times to player:', this._timesToPlay);
  }

  startPlay(): void {
    logger.log('[PlayerOperator] startPlay');
    this._maybePlay();
  }

  stopPlay(): void {
    logger.log('[PlayerOperator] stopPlay');
    this._killSwitched = true;
    this._makeSureStop();
  }

  isPlaying(): boolean {
    logger.log('[PlayerOperator] isPlaying: ', this._isPlaying);
    return this._isPlaying;
  }

  _getRandomNumber(low: number, up: number): number {
    return low + parseInt(Math.random() * (up - low), 10);
  }

  _getTimesToPlay(): number {
    let timesToPlay = 0;
    if (this._infinityLoop) {
      timesToPlay = 0
    } else {
      if (this._timesToPlayLowBoundary === this._timesToPlayUpBoundary) {
        timesToPlay = this._timesToPlayLowBoundary;
      } else {
        timesToPlay = this._getRandomNumber(this._timesToPlayLowBoundary, this._timesToPlayUpBoundary);
      }
    }

    return timesToPlay;
  }

  _maybePlay(): void {
    logger.log('[PlayerOperator] _play');
    if (!this._infinityLoop && this._playedTimes >= this._timesToPlay) {
      this._isPlaying = false;
      logger.log('[PlayerOperator] _play: early: played enough times', this._timesToPlay, this._playedTimes);
      const cb = this._finitePlayFinishedCallback;
      if (cb) {
        cb();
      }
      return;
    }

    if (this._playedTimes === 0) {
      this._singleShootOfPlay();
      return;
    }

    let nextPlayDelayMS = 0;

    if (this._timeoutLowBoundaryMS === this._timeoutUpBoundaryMS) {
      nextPlayDelayMS = this._timeoutLowBoundaryMS;
    } else {
      nextPlayDelayMS = this._getRandomNumber(this._timeoutLowBoundaryMS, this._timeoutUpBoundaryMS);
    }

    logger.log('[PlayerOperator] _play delay for ', nextPlayDelayMS);
    this._nextPlayTimeout = setTimeout(() => {
      clearTimeout(this._nextPlayTimeout);
      this._nextPlayTimeout = null;
      this._singleShootOfPlay();
    }, nextPlayDelayMS);
  }

  _playFinished(): void {
    this._playerController = null;
    this._playedTimes += 1;
    logger.log('[PlayerOperator] _playFinished, played times: ', this._playedTimes);
    this._maybePlay();
  }

  _pickMp3Files(): Array<string> {
    let pickedMp3Files = null;
    if (this._config.pickOneMp3OtherwisePlayAll) {
      const idx = parseInt(Math.random() * this._mp3FilePaths.length);
      pickedMp3Files = [this._mp3FilePaths[idx]];
    } else {
      pickedMp3Files = this._mp3FilePaths;
    }
    return pickedMp3Files;
  }

  _singleShootOfPlay():void {
    if (this._killSwitched) {
      return;
    }
    logger.log('[PlayerOperator] _singleShootOfPlay');
    this._isPlaying = true;

    const currentPlayerController = new PlayerController();

    const mp3FilePaths = this._pickMp3Files();
    const volume = this._config.volumePercentage;

    const mp3s = mp3FilePaths.map((path) => {
      return new Mp3(path, volume);
    })
    const player = new Player(currentPlayerController, mp3s);

    currentPlayerController.setPlayerFinishCallback(() => {
      this._playFinished();
    });
    currentPlayerController.startPlayer();
    this._playerController = currentPlayerController;
  }

  _makeSureStop(): void {
    logger.log('[PlayerOperator] _makeSureStop');
    if (this._nextPlayTimeout) {
      clearTimeout(this._nextPlayTimeout);
    }

    const playerController = this._playerController;
    if (playerController) {
      playerController.stopPlayer();
    }

    this._isPlaying = false;
  }
}

module.exports = PlayerOperator;
