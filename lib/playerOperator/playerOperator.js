const Mp3 = require('../mp3/mp3');

const Player = require('../mp3/player');

const PlayerController = require('../mp3/playerController');

const logger = require('../logger/logger');

class PlayerOperator {
  // set low and up boundary same value to have fix times to loop
  // set low and up boundary same value to have fix timeout
  // time to play if not infinity play
  constructor(config, finitePlayFinishedCallback, configGetter) {
    this._infinityLoop = config.infinityLoop;
    this._timesToPlayLowBoundary = config.timesToPlayLowBoundary;
    this._timesToPlayUpBoundary = config.timesToPlayUpBoundary;
    this._timeoutLowBoundaryMS = config.timeoutLowBoundaryMS;
    this._timeoutUpBoundaryMS = config.timeoutUpBoundaryMS;
    this._finitePlayFinishedCallback = finitePlayFinishedCallback;
    this._timesToPlay = this._getTimesToPlay();
    this._isPlaying = false;
    this._playedTimes = 0;
    this._killSwitched = false;
    this._config = config;
    this._configGetter = configGetter;
    logger.log('[PlayerOperator] construct: times to player:', this._timesToPlay);
  }

  startPlay(optionalMp3File) {
    logger.log('[PlayerOperator] startPlay');

    this._maybePlay(optionalMp3File);
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

  _maybePlay(optionalMp3File) {
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
      this._singleShootOfPlay(optionalMp3File);

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

      this._singleShootOfPlay(optionalMp3File);
    }, nextPlayDelayMS);
  }

  _playFinished(optionalMp3File) {
    this._playerController = null;
    this._playedTimes += 1;
    logger.log('[PlayerOperator] _playFinished, played times: ', this._playedTimes);

    this._maybePlay(optionalMp3File);
  }

  _pickMp3Files() {
    let pickedMp3Files = null;

    if (this._config.pickOneMp3OtherwisePlayAll) {
      const idx = parseInt(Math.random() * this._config.mp3Files.length);
      pickedMp3Files = [this._config.mp3Files[idx]];
    } else {
      pickedMp3Files = this._config.mp3Files;
    }

    return pickedMp3Files;
  }

  _singleShootOfPlay(optionalMp3File) {
    if (this._killSwitched) {
      return;
    }

    const configGetter = this._configGetter;

    if (configGetter) {
      this._config = configGetter();
    }

    logger.log('[PlayerOperator] _singleShootOfPlay');
    this._isPlaying = true;
    const currentPlayerController = new PlayerController();
    let mp3FilePaths = [];

    if (optionalMp3File == null) {
      mp3FilePaths = this._pickMp3Files();
    } else {
      mp3FilePaths = [optionalMp3File];
    }

    const volume = this._config.volumePercentage;
    const mp3s = mp3FilePaths.map(path => {
      return new Mp3(path, volume);
    });
    const player = new Player(currentPlayerController, mp3s);
    currentPlayerController.setPlayerFinishCallback(() => {
      this._playFinished(optionalMp3File);
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