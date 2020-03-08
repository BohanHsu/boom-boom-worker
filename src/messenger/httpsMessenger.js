// @flow

const https = require('https');
const logger = require('../logger/logger');

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

  ping(outMessage: OutMessageType, cb: (InMessageType) => void): void {
    this._syncHttps(this.path, outMessage, (jsonBody: any) => {
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
        }


        const duang = jsonBody.duang;
        if (duang) {
          inMessage.duang = duang;
        }
        console.log(jsonBody, duang, inMessage);

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
          // TODO
          // if (cb) {
          //   cb({httpCode, globalSwitch:false});
          // }
          cb({httpCode});

          return;
        }

        const jsonBody = JSON.parse(body);
        // TODO
        // if (cb) {
        //   let inMessage:any = {
        //     httpCode,
        //     globalSwitch: jsonBody.globalSwitch,
        //     shouldPlay: jsonBody.shouldPlay,
        //   };
        //   const duang = jsonBody.duang;
        //   if (duang) {
        //     inMessage['duang'] = duang;
        //   }
        //   cb(inMessage);
        // }
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

