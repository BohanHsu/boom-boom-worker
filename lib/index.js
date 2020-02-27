// Example of using MP3 player
// const Mp3 = require('./mp3/mp3');
// const Player = require('./mp3/player');
// const PlayerController = require('./mp3/playerController');
// 
// const mp3s = [new Mp3(`/Users/bohanxu/Downloads/short.mp3`),
//   new Mp3(`/Users/bohanxu/Downloads/short.mp3`),
//   //new Mp3(`/Users/bohanxu/Downloads/short.mp3`),
//   //new Mp3(`/Users/bohanxu/Downloads/short.mp3`), 
//   /*new Mp3(`/Users/bohanxu/Downloads/short.mp3`)*/];
// 
// 
// const playerController = new PlayerController();
// 
// const player = new Player(playerController, mp3s);
// 
// playerController.startPlayer();
// 
// setTimeout(() => {
//   playerController.stopPlayer();
// }, 10000);
console.log(process.argv);
const identification = process.argv[2];
const hostname = process.argv[3];
const path = process.argv[4];
const port = parseInt(process.argv[5]);

const HttpsMessenger = require('./messenger/httpsMessenger');

const WorkerMaster = require('./master');

console.log('index.js');
const messenger = new HttpsMessenger(identification, hostname, path, port);
const master = new WorkerMaster(messenger); // Example of using messenger
// messenger.syncHttps({
//   isPlaying: false,
//   ipAddress: "",
// }, (outMessage: OutMessageType) => {
//   console.log(outMessage);
// });