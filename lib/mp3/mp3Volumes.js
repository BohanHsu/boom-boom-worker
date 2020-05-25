function OmxplayerVolume(volumePercentage) {
  return Math.floor(volumePercentage * 20 - 1000);
}

module.exports = {
  OmxplayerVolume
};