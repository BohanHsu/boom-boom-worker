const https = require('https');

class HttpsMessenger {
  constructor(identification, hostname, path, port) {
    this.identification = identification;
    this.hostname = hostname;
    this.path = path;
    this.port = port;
  }

  syncHttps(outMessage, cb) {
    console.error('[httpsMessenger] https messenger syncHttp:', outMessage);
    const data = JSON.stringify({
      whoami: this.identification,
      isPlaying: outMessage.isPlaying,
      duang: outMessage.duang
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
              httpCode
            });
          }

          return;
        }

        const jsonBody = JSON.parse(body);

        if (cb) {
          let inMessage = {
            httpCode,
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
      console.error('[httpsMessenger] https messenger encounter error:', error);

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