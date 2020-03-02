// @flow

const Player = require('./player');

class PlayerController {
  _player: ?Player;
  _isPlaying: boolean;
  _playerFinishedCallback: ?(() => void);

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

  setPlayerFinishCallback(cb: (() => void)): void {
    this._playerFinishedCallback = cb;
  }

  playerStoped(): void {
    this._isPlaying = false;
    if (this._playerFinishedCallback) {
      this._playerFinishedCallback();
    }
  }

}

module.exports = PlayerController;
