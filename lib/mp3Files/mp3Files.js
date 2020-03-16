const fs = require('fs');

class Mp3Files {
  constructor(basePath) {
    this._basePath = basePath;
  }

  findMp3Files() {
    const allFiles = fs.readdirSync(this._basePath);
    const mp3Files = allFiles.filter(path => {
      const nodes = path.split(".");
      return "mp3" === nodes[nodes.length - 1];
    });
    return mp3Files;
  }

}

module.exports = Mp3Files;