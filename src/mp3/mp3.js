// @flow

//$FlowFixMe
const player = require('play-sound')(opts = {})

const logger = require('../logger/logger');

const {OmxplayerVolume} = require('./mp3Volumes');

const {OmxplayerKill} = require('./mp3Processes');

class Mp3 {
  _audio: any;
  _filePath: string;
  _playFinishCallback: ?(() => void);
  _volumePercentage: ?number;

  constructor(filePath: string, volumePercentage: ?number) {
    this._filePath = filePath;
    this._playFinishCallback = null;
    this._volumePercentage = volumePercentage;
  }

  setPlayFinishCallback(cb: () => void) {
    this._playFinishCallback = cb;
  }

  play(): void {
    setTimeout(() => {
      this._play();
    }, 1)
  }

  _play(): void {
    const playerOptions = {};

    this._playerVolumeOption(playerOptions);

    logger.log("[mp3] playerOptions: ", playerOptions);

    this._audio = player.play(this._filePath, playerOptions, (err) => {
      if (err) {
        logger.log("err:", err);
      }

      if (this._playFinishCallback) {
        this._playFinishCallback();
      }
    });

  }

  _playerVolumeOption(options: {[string]:any}): void {
    const volumePercentage = this._volumePercentage;
    if (volumePercentage) {
      const volume = OmxplayerVolume(volumePercentage);
      options.omxplayer = ['--vol', volume];
    }
  }

  stop(): void {
    const audio = this._audio;
    if (audio) {
      audio.kill();
      this._audio = null;
    }
    OmxplayerKill();
  }

  isPlaying(): boolean {
    return this._audio != null;
  }
}

module.exports = Mp3;
