// @flow

const https = require('https');

import type {InMessageType, OutMessageType} from './messageTypes';

class HttpsMessenger {
  identification: string;
  hostname: string;
  path: string;
  port: number;

  constructor(identification: string, hostname: string, path: string, port: number) {
    this.identification = identification;
    this.hostname = hostname;
    this.path = path;
    this.port = port;
  }

  syncHttps(outMessage: OutMessageType, cb: (OutMessageType) => void): void {
    console.error('[httpsMessenger] https messenger syncHttp:', outMessage);
    const data = JSON.stringify({"whoami":this.identification, "isPlaying": false});

    const options = {
      hostname: this.hostname,
      port: this.port,
      path: this.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    let body = '';
    let httpCode = -1;

    const req = https.request(options, (res) => {
      httpCode = res.statusCode;

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (httpCode !== 200) {
          if (cb) {
            cb({httpCode});
          }

          return;
        }

        const jsonBody = JSON.parse(body);
        if (cb) {
          cb({
            httpCode,
            shouldPlay: jsonBody.shouldPlay,
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('[httpsMessenger] https messenger encounter error:', error);
      if (cb) {
        cb({httpCode: -1});
      }
    })

    req.write(data);
    req.end();
  }

}

module.exports = HttpsMessenger;

