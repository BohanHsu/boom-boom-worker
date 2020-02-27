// @flow

const Mp3 = require('./mp3');
const PlayerController = require('./playerController');

class Player {
  _controller: PlayerController;
  _mp3s: Array<Mp3>;
  _playedCnt: number;

  constructor(controller: PlayerController, mp3s: Array<Mp3>) {
    this._controller = controller;
    this._controller.hookPlayer(this);
    this._mp3s = mp3s;
    this._playedCnt = 0;
  }

  onControllerReceiveStart(): void {
    this._play();
  }

  onControllerReceiveStop(): void {
    // Stop the current playing mp3
    const playingIdx = this._playingIdx();
    this._mp3s[playingIdx].stop();

    // to eliminate race condition, stop all mp3s
    this._mp3s.forEach((mp3: Mp3) => mp3.stop());
  }

  _playingIdx(): number {
    return this._playedCnt % this._mp3s.length;
  }

  _play(): void {
    const toPlayIdx = this._playingIdx();
    
    // start from begin but not first time
    if (toPlayIdx === 0 && this._playedCnt !== 0) {
      // query controller whether to loop
      if (!this._controller.shouldLoop()) {
        return;
      }
    }

    const mp3 = this._mp3s[toPlayIdx];

    // Play this mp3

    mp3.setPlayFinishCallback(() => {this._handleMp3PlayFinish();});
    mp3.play();
  }

  _handleMp3PlayFinish(): void {
    if (!this._controller.isPlaying()) {
      return;
    }

    // Increase played count
    this._playedCnt += 1;
    // Play next mp3
    this._play();
  }
}

module.exports = Player;
