var _, blacklist, client, commands, redis, thunkify;

// external modules
commands = require('redis/lib/commands');
redis = require('redis');
thunkify = require('thunkify');

// internal modules
_ = appRequire('utils/utils');

// monkey patch Multi#exec to be a thunk
redis.Multi.prototype.exec = thunkify(redis.Multi.prototype.exec);

client = redis.createClient();
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
