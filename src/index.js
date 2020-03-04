console.log(process.argv);

const identification = process.argv[2];
const hostname = process.argv[3];
const path = process.argv[4];
const port = parseInt(process.argv[5]);
const mp3FilePath = process.argv[6];

const HttpsMessenger = require('./messenger/httpsMessenger');
const WorkerMaster = require('./master');

const messenger = new HttpsMessenger(identification,
                                     hostname,
                                     path,
                                     port);
import type {OutMessageType} from './messenger/messageTypes';

const master = new WorkerMaster(messenger, mp3FilePath);
