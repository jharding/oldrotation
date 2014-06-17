var _, blacklist, client, commands, config, redis, thunkifiedClient,
    thunkify, url;

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

// redis client commands not to thunkify
blacklist = ['multi'];

thunkifiedClient =_.chain(commands)
.map(function(command) { return command.split(' ')[0]; })
.reduce(function(memo, command) {
  memo[command] = _.contains(blacklist, command) ?
    client[command].bind(client) :
    thunkify(client[command]).bind(client);

  return memo;
}, {})
.value();

// exports
module.exports = {
  client: thunkifiedClient,

  keys: {
    get userIdIncr() {
      return 'rot:user:id_incr';
    },

    rdioIdToUserId: function(rdioId) {
      return _.format('rot:user:rdio_id=%s', rdioId);
    },

    rotationMetadata: function(userId) {
      return _.format('rot:user:id=%s:rdio:rotation:playlist', userId);
    },

    rotationTracks: function(userId) {
      return _.format('rot:user:id=%s:rdio:rotation:tracks', userId);
    },

    track: function(trackId) {
      return _.format('rot:rdio:track:id=%s', trackid);
    },

    user: function(userId) {
      return _.format('rot:user:id=%s', userId);
    }
  }
};
