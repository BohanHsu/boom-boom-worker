// @flow

function OmxplayerVolume(volumePercentage: number): number {
  return Math.floor(volumePercentage * 20 - 1000);
}

module.exports = {
  OmxplayerVolume,
};
