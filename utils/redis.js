var _, blacklist, client, commands, config, redis, thunkify, url;

// external modules
commands = require('redis/lib/commands');
redis = require('redis');
thunkify = require('thunkify');
url = require('url');

// internal modules
_ = appRequire('utils/utils');
config = appRequire('utils/config');

// monkey patch Multi#exec to be a thunk
redis.Multi.prototype.exec = thunkify(redis.Multi.prototype.exec);

// configure the redis client
client = redis.createClient(config.redis.url.port, config.redis.url.hostname, {
  no_ready_check: true,
  auth_pass: config.redis.url.auth && config.redis.url.auth.split(':')[1]
});

blacklist = ['multi']; // don't thunkify

// exports
module.exports = _.chain(commands)
.map(function(command) { return command.split(' ')[0]; })
.reduce(function(memo, command) {
  memo[command] = _.contains(blacklist, command) ?
    client[command].bind(client) :
    thunkify(client[command]).bind(client);

  return memo;
}, {})
.value();
