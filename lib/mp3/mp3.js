//$FlowFixMe
const player = require('play-sound')(opts = {});

const logger = require('../logger/logger');

class Mp3 {
  constructor(filePath) {
    this._filePath = filePath;
    this._playFinishCallback = null;
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
    this._audio = player.play(this._filePath, err => {
      if (err) {
        logger.log("err:", err);
      }

      if (this._playFinishCallback) {
        this._playFinishCallback();
      }
    });
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