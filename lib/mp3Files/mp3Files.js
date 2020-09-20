const fs = require('fs');

class Mp3Files {
  constructor(basePath) {
    this._basePath = basePath;
  }

  findMp3Files() {
    const allFiles = fs.readdirSync(this._basePath);
    let mp3Files = allFiles.filter(path => {
      const nodes = path.split(".");
      return "mp3" === nodes[nodes.length - 1];
    });
    mp3Files = mp3Files.map(name => {
      let appendSlash = true;

      if (this._basePath[this._basePath.length - 1] === '/') {
        appendSlash = false;
      }

      let partialName = (appendSlash ? '/' : '') + name;
      return this._basePath + partialName;
    });
    return mp3Files;
  }

}

module.exports = Mp3Files;