var FRESH_THRESHOLD_IN_DAYS, moment;

// external modules
moment = require('moment');

// constants
FRESH_THRESHOLD_IN_DAYS = 30;

// exports
module.exports = {
  get now() {
    return moment.utc().unix();
  },

  get fresh() {
    return moment.utc().subtract('days', FRESH_THRESHOLD_IN_DAYS).unix();
  },
};
