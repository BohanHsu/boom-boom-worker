module.exports = {
  shouldPlay: {
    mp3Files: [],
    pickOneMp3OtherwisePlayAll: false,
    infinityLoop: true,
    timesToPlayLowBoundary: -1,
    timesToPlayUpBoundary: -1,
    timeoutLowBoundaryMS: 1000,
    timeoutUpBoundaryMS: 10000
  },
  duang: {
    mp3Files: [],
    pickOneMp3OtherwisePlayAll: true,
    infinityLoop: false,
    timesToPlayLowBoundary: 1,
    timesToPlayUpBoundary: 3,
    timeoutLowBoundaryMS: 1000,
    timeoutUpBoundaryMS: 3000
  }
};