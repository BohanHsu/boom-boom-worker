module.exports = {
  shouldPlay: {
    mp3Files: ['/Users/bohanxu/Downloads/sms-alert-1-daniel_simon.mp3', '/Users/bohanxu/Downloads/sms-alert-2-daniel_simon.mp3', '/Users/bohanxu/Downloads/sms-alert-3-daniel_simon.mp3'],
    infinityLoop: true,
    timesToPlayLowBoundary: -1,
    timesToPlayUpBoundary: -1,
    timeoutLowBoundaryMS: 1000,
    timeoutUpBoundaryMS: 10000
  },
  duang: {
    mp3Files: ['/Users/bohanxu/Downloads/sms-alert-1-daniel_simon.mp3', '/Users/bohanxu/Downloads/sms-alert-2-daniel_simon.mp3', '/Users/bohanxu/Downloads/sms-alert-3-daniel_simon.mp3'],
    infinityLoop: false,
    timesToPlayLowBoundary: 1,
    timesToPlayUpBoundary: 3,
    timeoutLowBoundaryMS: 1000,
    timeoutUpBoundaryMS: 3000
  }
};