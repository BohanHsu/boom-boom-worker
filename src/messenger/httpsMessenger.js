// @flow

const https = require('https');
const logger = require('../logger/logger');

import type {InMessageType, OutMessageType} from './messageTypes';

class HttpsMessenger {
  identification: string;
  hostname: string;
  pingPath: string;
  port: number;

  constructor(identification: string, hostname: string, pingPath: string, port: number) {
    this.identification = identification;
    this.hostname = hostname;
    this.pingPath = pingPath;
    this.port = port;
  }

  ping(outMessage: OutMessageType, cb: (InMessageType) => void): void {
    this._syncHttps(this.pingPath, outMessage, (jsonBody: any) => {
      if (jsonBody.httpCode !== 200) {
        cb({
          httpCode: jsonBody.httpCode,
          globalSwitch: false,
        });
      } else {
        let inMessage: InMessageType = {
          httpCode: jsonBody.httpCode,
          globalSwitch: jsonBody.globalSwitch,
          shouldPlay: jsonBody.shouldPlay,
          config: jsonBody.config,
        }


        const duang = jsonBody.duang;
        if (duang) {
          inMessage.duang = duang;
        }

        cb(inMessage);
      }
    });
  }

  _syncHttps(path: string, outMessage:any, cb: (any) => void): void {
    logger.log('[httpsMessenger] https messenger syncHttp:', outMessage)
    let jsonData = {
      whoami:this.identification, 
      ...outMessage,
    };
    const data = JSON.stringify(jsonData);

    const options = {
      hostname: this.hostname,
      port: this.port,
      path: path,
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
          cb({httpCode});
          return;
        }

        const jsonBody = JSON.parse(body);
        logger.error('[httpsMessenger] https messenger received message:', jsonBody);
        cb({
          httpCode,
          ...jsonBody,
        });
      });
    });

    req.on('error', (error) => {
      logger.error('[httpsMessenger] https messenger encounter error:', error);
      if (cb) {
        cb({httpCode: -1});
      }
    })

    req.write(data);
    req.end();
  }
}

module.exports = HttpsMessenger;

