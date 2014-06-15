var _, creds;

// internal modules
_ = appRequire('utils/utils');
creds = appRequire('credentials/creds.json');

// exports
module.exports = _.reduce(creds, function(memo, secrets, service) {
  var secretGetter;

  secretGetter = _.reduce(secrets, function(memo, v, k) {
    memo.__defineGetter__(k, function() { return v; });
    return memo;
  }, {});

  memo.__defineGetter__(service, function() { return secretGetter; });
  return memo;
}, {});
