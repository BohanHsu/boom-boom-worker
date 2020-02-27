// @flow

//$FlowFixMe
const player = require('play-sound')(opts = {})

class Mp3 {
  _audio: any;
  _filePath: String;
  _playFinishCallback: ?(() => void);

  constructor(filePath: String) {
    this._filePath = filePath;
    this._playFinishCallback = null;
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
    this._audio = player.play(this._filePath, (err) => {
      if (err) {
        console.log("err:", err);
      }

      if (this._playFinishCallback) {
        this._playFinishCallback();
      }
    });

  }

  stop(): void {
    const audio = this._audio;
    if (audio) {
      audio.kill();
      this._audio = null;
    }
  }

  isPlaying(): boolean {
    return this._audio != null;
  }
}

module.exports = Mp3;
