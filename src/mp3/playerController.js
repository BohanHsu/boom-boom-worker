// @flow

const Player = require('./player');

class PlayerController {
  _player: ?Player;
  _isPlaying: boolean;

  constructor() {
    this._player = null;
    this._isPlaying = false;
  }

  hookPlayer(player: Player): void {
    this._player = player;
  }

  shouldLoop(): boolean {
    //return false;
    return true;
  }

  isPlaying(): boolean {
    return this._isPlaying;
  }

  startPlayer(): void {
    this._isPlaying = true;
    if (this._player) {
      this._player.onControllerReceiveStart();
    }
  }

  stopPlayer(): void {
    this._isPlaying = false;
    if (this._player) {
      this._player.onControllerReceiveStop();
    }
  }
}

module.exports = PlayerController;
