var _, redis, User, users;

// internal modules
_ = appRequire('utils/utils');
redis = appRequire('utils/redis');
User = appRequire('models/user');

users = module.exports = {
  findById: function* refresh(id) {
    var json, keys;

    keys = buildKeys(id);
    json = yield redis.hgetall(keys.base);

     return json ? new User(json) : null;
  },

  refresh: function* refresh(rdio, token, secret) {
    var json, keys;

    json = jsonFromRdioResp(rdio, token, secret);
    keys = buildKeys(json.id);

    yield redis.multi()
    .sadd(keys.all, json.id)
    .hmset(keys.base, json)
    .exec();

    return new User(json);
  }
};

function jsonFromRdioResp(json, token, secret) {
  return {
    id: json.key,
    firstName: json.firstName,
    lastName: json.lastName,
    url: json.url,
    icon100: json.icon,
    icon250: json.icon250,
    icon500: json.icon500,
    token: token,
    secret: secret
  };
}

function buildKeys(id) {
  return {
    all: 'users',
    base: _.format('users/%s', id)
  };
}
