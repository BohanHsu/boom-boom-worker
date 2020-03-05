const https = require('https');

const logger = require('../logger/logger');

class HttpsMessenger {
  constructor(identification, hostname, path, port) {
    this.identification = identification;
    this.hostname = hostname;
    this.path = path;
    this.port = port;
  }

  syncHttps(outMessage, cb) {
    logger.log('[httpsMessenger] https messenger syncHttp:', outMessage);
    const data = JSON.stringify({
      whoami: this.identification,
      isPlaying: outMessage.isPlaying,
      duang: outMessage.duang,
      ip: outMessage.ip
    });
    const options = {
      hostname: this.hostname,
      port: this.port,
      path: this.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let body = '';
    let httpCode = -1;
    const req = https.request(options, res => {
      httpCode = res.statusCode;
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        if (httpCode !== 200) {
          if (cb) {
            cb({
              httpCode,
              globalSwitch: false
            });
          }

          return;
        }

        const jsonBody = JSON.parse(body);

        if (cb) {
          let inMessage = {
            httpCode,
            globalSwitch: jsonBody.globalSwitch,
            shouldPlay: jsonBody.shouldPlay
          };
          const duang = jsonBody.duang;

          if (duang) {
            inMessage['duang'] = duang;
          }

          cb(inMessage);
        }
      });
    });
    req.on('error', error => {
      logger.error('[httpsMessenger] https messenger encounter error:', error);

      if (cb) {
        cb({
          httpCode: -1
        });
      }
    });
    req.write(data);
    req.end();
  }

}

module.exports = HttpsMessenger;