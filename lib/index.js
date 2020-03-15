const identification = process.argv[2];
const hostname = process.argv[3];
const path = process.argv[4];
const reportConfigPath = process.argv[5];
const port = parseInt(process.argv[6]);

const HttpsMessenger = require('./messenger/httpsMessenger');

const WorkerMaster = require('./master');

const messenger = new HttpsMessenger(identification, hostname, path, reportConfigPath, port);
const master = new WorkerMaster(messenger);