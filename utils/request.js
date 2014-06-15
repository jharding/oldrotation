var request, thunkify;

// external modules
request = require('request');
thunkify = require('thunkify');

// exports
module.exports = {
  post: thunkify(request.post).bind(request)
};
