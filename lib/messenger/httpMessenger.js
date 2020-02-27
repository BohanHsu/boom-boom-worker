const https = require('https');

class HttpMessenger {
  sync(outMessage, cb) {
    const data = JSON.stringify({
      "whoami": "-sba3cglgg1010",
      "isPlaying": false
    });
    const options = {
      hostname: 'control-tower-sl1.herokuapp.com',
      port: 443,
      path: '/api/worker/ping',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let body = '';
    let httpCode = -1;
    const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      httpCode = res.statusCode;
      res.on('data', chunk => {
        // process.stdout.write(d)
        console.log(chunk);
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
        console.log('jsonBody', jsonBody);

        if (cb) {
          cb({
            httpCode,
            shouldPlay: jsonBody.shouldPlay
          });
        }
      });
    });
    req.on('error', error => {
      console.error(error);
    });
    req.write(data);
    req.end();
  }

}

module.exports = HttpMessenger;