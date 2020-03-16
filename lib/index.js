const identification = process.argv[2];
const hostname = process.argv[3];
const pingPath = process.argv[4];
const reportConfigPath = process.argv[5];
const port = parseInt(process.argv[6]);
const mp3FilesPath = process.argv[7];

const HttpsMessenger = require('./messenger/httpsMessenger');

const WorkerMaster = require('./master');

const Mp3Files = require('./mp3Files/mp3Files');

const messenger = new HttpsMessenger(identification, hostname, pingPath, reportConfigPath, port);
const mp3Files = new Mp3Files(mp3FilesPath);
const master = new WorkerMaster(messenger, mp3Files);