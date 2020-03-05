const Mp3 = require('../mp3/mp3');

const Player = require('../mp3/player');

const PlayerController = require('../mp3/playerController');

const logger = require('../logger/logger');

class PlayerOperator {
  // set low and up boundary same value to have fix times to loop
  // set low and up boundary same value to have fix timeout
  // time to play if not infinity play
  constructor(mp3FilePaths, infinityLoop, timesToPlayLowBoundary, timesToPlayUpBoundary, // set low and up boundary same value to have fix times to loop
  timeoutLowBoundaryMS, timeoutUpBoundaryMS, // set low and up boundary same value to have fix timeout
  finitePlayFinishedCallback) {
    this._mp3FilePaths = mp3FilePaths;
    this._infinityLoop = infinityLoop;
    this._timesToPlayLowBoundary = timesToPlayLowBoundary;
    this._timesToPlayUpBoundary = timesToPlayUpBoundary;
    this._timeoutLowBoundaryMS = timeoutLowBoundaryMS;
    this._timeoutUpBoundaryMS = timeoutUpBoundaryMS;
    this._timesToPlay = this._getTimesToPlay();
    this._isPlaying = false;
    this._playedTimes = 0;
    this._killSwitched = false;
    this._finitePlayFinishedCallback = finitePlayFinishedCallback;
    logger.log('[PlayerOperator] construct: times to player:', this._timesToPlay);
  }

  startPlay() {
    logger.log('[PlayerOperator] startPlay');

    this._maybePlay();
  }

  stopPlay() {
    logger.log('[PlayerOperator] stopPlay');
    this._killSwitched = true;

    this._makeSureStop();
  }

  isPlaying() {
    logger.log('[PlayerOperator] isPlaying: ', this._isPlaying);
    return this._isPlaying;
  }

  _getRandomNumber(low, up) {
    return low + parseInt(Math.random() * (up - low), 10);
  }

  _getTimesToPlay() {
    let timesToPlay = 0;

    if (this._infinityLoop) {
      timesToPlay = 0;
    } else {
      if (this._timesToPlayLowBoundary === this._timesToPlayUpBoundary) {
        timesToPlay = this._timesToPlayLowBoundary;
      } else {
        timesToPlay = this._getRandomNumber(this._timesToPlayLowBoundary, this._timesToPlayUpBoundary);
      }
    }

    return timesToPlay;
  }

  _maybePlay() {
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

  _playFinished() {
    this._playerController = null;
    this._playedTimes += 1;
    logger.log('[PlayerOperator] _playFinished, played times: ', this._playedTimes);

    this._maybePlay();
  }

  _singleShootOfPlay() {
    if (this._killSwitched) {
      return;
    }

    logger.log('[PlayerOperator] _singleShootOfPlay');
    this._isPlaying = true;
    const currentPlayerController = new PlayerController();

    const mp3s = this._mp3FilePaths.map(path => {
      return new Mp3(path);
    });

    const player = new Player(currentPlayerController, mp3s);
    currentPlayerController.setPlayerFinishCallback(() => {
      this._playFinished();
    });
    currentPlayerController.startPlayer();
    this._playerController = currentPlayerController;
  }

  _makeSureStop() {
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