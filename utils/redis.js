var client, redis, thunkify;

// internal modules
redis = require('redis');
thunkify = require('thunkify');

client = redis.createClient();

// exports
module.exports = {
  hmset: thunkify(client.hmset).bind(client),
  hgetall: thunkify(client.hgetall).bind(client),
  set: thunkify(client.set).bind(client),
  zadd: thunkify(client.zadd).bind(client),
  zrangebyscore: thunkify(client.zrangebyscore).bind(client)
};
