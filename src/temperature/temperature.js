const execSync = require('child_process').execSync;

module.exports = {
  getTemperature: function(commandPath) {
    const temperatureReading = execSync(commandPath).toString();

    if (temperatureReading) {
      const pattern = /\d+\.*\d*/;
      const matchResult = temperatureReading.match(pattern);
      if (matchResult) {
        return matchResult[0];
      }
    }

    return '';
  },
};
