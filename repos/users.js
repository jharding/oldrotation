var _, keys, redis, repo;

// internal modules
_ = appRequire('utils/utils');
redis = appRequire('utils/redis');

keys = {
  get idIncr() {
    return 'rot:user:id_incr';
  },

  idFromRdioId: function(rdioId) {
    return _.format('rot:rdio:user:%s:rot_user_id', rdioId);
  },

  rotation: function(id) {
    return _.format('rot:user:id:%s:rdio:rotation_id', id);
  },

  user: function(id) {
    return _.format('rot:user:id:%s', id);
  }
};

// exports
repo = module.exports = {
  createFromRdio: function* createFromRdio(rdioJson, token, secret) {
    var userHash, userId;

    userId = yield redis.incr(keys.idIncr);
    userHash = userHashFromRdioData(userId, rdioJson, token, secret);

    yield redis.multi()
    .set(keys.idFromRdioId(userHash.rdioUserId), userId)
    .hmset(keys.user(userId), userHash)
    .exec();

    return userHash;
  },

  findById: function* findById(id) {
    return yield redis.hgetall(keys.user(id));
  },

  findByRdioId: function* findByRdioId(rdioId) {
    var userId = yield redis.get(keys.idFromRdioId(rdioId));
    return userId ? (yield redis.hgetall(keys.user(userId))) : null;
  },

  updateRdioCreds: function* updateRdioCreds(id, token, secret) {
    yield redis.hmset(keys.user(id), { rdioToken: token, rdioSecret: secret });
  }
};

function userHashFromRdioData(userId, rdioJson, token, secret) {
  return {
    id: userId,
    firstName: rdioJson.firstName,
    rdioUserId: rdioJson.key,
    rdioToken: token,
    rdioSecret: secret
  };
}
