//$FlowFixMe
const player = require('play-sound')(opts = {});

const logger = require('../logger/logger');

const {
  OmxplayerVolume
} = require('./mp3Volumes');

class Mp3 {
  constructor(filePath, volumePercentage) {
    this._filePath = filePath;
    this._playFinishCallback = null;
    this._volumePercentage = volumePercentage;
  }

  setPlayFinishCallback(cb) {
    this._playFinishCallback = cb;
  }

  play() {
    setTimeout(() => {
      this._play();
    }, 1);
  }

  _play() {
    const playerOptions = {};

    this._playerVolumeOption(playerOptions);

    logger.log("[mp3] playerOptions: ", playerOptions);
    this._audio = player.play(this._filePath, playerOptions, err => {
      if (err) {
        logger.log("err:", err);
      }

      if (this._playFinishCallback) {
        this._playFinishCallback();
      }
    });
  }

  _playerVolumeOption(options) {
    const volumePercentage = this._volumePercentage;

    if (volumePercentage) {
      const volume = OmxplayerVolume(volumePercentage);
      options.omxplayer = ['--vol', volume];
    }
  }

  stop() {
    const audio = this._audio;

    if (audio) {
      audio.kill();
      this._audio = null;
    }
  }

  isPlaying() {
    return this._audio != null;
  }

}

module.exports = Mp3;