//const youtube = require('./youtube/youtube');
const Mp3 = require('./mp3/mp3');
const Player = require('./mp3/player');
const PlayerController = require('./mp3/playerController');

const mp3s = [new Mp3(`/Users/bohanxu/Downloads/short.mp3`),
  new Mp3(`/Users/bohanxu/Downloads/short.mp3`),
  //new Mp3(`/Users/bohanxu/Downloads/short.mp3`),
  //new Mp3(`/Users/bohanxu/Downloads/short.mp3`), 
  /*new Mp3(`/Users/bohanxu/Downloads/short.mp3`)*/];


const playerController = new PlayerController();

const player = new Player(playerController, mp3s);

playerController.startPlayer();

setTimeout(() => {
  playerController.stopPlayer();
}, 10000);


//youtube()

