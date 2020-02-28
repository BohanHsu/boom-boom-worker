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
    // return true;
    return false;
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

  playerStoped(): void {
    this._isPlaying = false;
  }

}

module.exports = PlayerController;
