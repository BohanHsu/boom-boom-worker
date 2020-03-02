const Player = require('./player');

class PlayerController {
  constructor() {
    this._player = null;
    this._isPlaying = false;
  }

  hookPlayer(player) {
    this._player = player;
  }

  shouldLoop() {
    // return true;
    return false;
  }

  isPlaying() {
    return this._isPlaying;
  }

  startPlayer() {
    this._isPlaying = true;

    if (this._player) {
      this._player.onControllerReceiveStart();
    }
  }

  stopPlayer() {
    this._isPlaying = false;

    if (this._player) {
      this._player.onControllerReceiveStop();
    }
  }

  setPlayerFinishCallback(cb) {
    this._playerFinishedCallback = cb;
  }

  playerStoped() {
    this._isPlaying = false;

    if (this._playerFinishedCallback) {
      this._playerFinishedCallback();
    }
  }

}

module.exports = PlayerController;