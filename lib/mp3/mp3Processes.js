const {
  exec
} = require('child_process');

function OmxplayerKill() {
  exec('ps aux | grep omxplayer', (e, stdout) => {
    let lines = stdout.split("\n");
    let wordLines = lines.map(line => {
      let words = line.split(" ");
      let filteredWords = words.filter(word => {
        return word.length > 0;
      });
      return filteredWords;
    });
    wordLines = wordLines.filter(wordLine => {
      return wordLine.length > 0;
    });
    let processes = wordLines.map(wordLine => {
      return wordLine[1];
    });
    processes.forEach(pid => {
      exec('kill -9 ' + pid);
    });
  });
}

module.exports = {
  OmxplayerKill
};