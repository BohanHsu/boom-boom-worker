function OmxplayerVolume(volumePercentage) {
  return Math.floor(volumePercentage * 70.7 - 6070.7);
}

module.exports = {
  OmxplayerVolume
};