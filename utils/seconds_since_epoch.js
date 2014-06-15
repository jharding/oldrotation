var time;

// external modules
time = require('time');

// exports
module.exports = function secondsSinceEpoch() {
  return time.time();
};
