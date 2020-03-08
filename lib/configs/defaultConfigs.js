module.exports = {
  shouldPlay: {
    mp3Files: [// '/Users/bohanxu/Downloads/dog_bark.mp3', // TODO remove
    ],
    infinityLoop: true,
    timesToPlayLowBoundary: -1,
    timesToPlayUpBoundary: -1,
    timeoutLowBoundaryMS: 1000,
    timeoutUpBoundaryMS: 10000
  },
  duang: {
    mp3Files: [// '/Users/bohanxu/Downloads/dog_bark.mp3', // TODO remove
    ],
    infinityLoop: false,
    timesToPlayLowBoundary: 1,
    timesToPlayUpBoundary: 3,
    timeoutLowBoundaryMS: 1000,
    timeoutUpBoundaryMS: 3000
  }
};