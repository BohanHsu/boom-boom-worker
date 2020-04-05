// @flow

function OmxplayerVolume(volumePercentage: number): number {
  return Math.floor(volumePercentage * 70.7 - 6070.7);
}

module.exports = {
  OmxplayerVolume,
};
