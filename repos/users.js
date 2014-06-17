var _, redis, rKeys, userRepo;

// export
// ------

userRepo = module.exports = {
  createFromRdio: function* createFromRdio(rdioJson, token, secret) {
    var hash, userId;

    userId = yield redis.incr(rKeys.userIdIncr);
    hash = userHashFromRdioData(userId, rdioJson, token, secret);

    yield redis.multi()
    .set(rKeys.rdioIdToUserId(hash.rdioUserId), userId)
    .hmset(rKeys.user(userId), hash)
    .exec();

    return hash;
  },

  findById: function* findById(id) {
    return yield redis.hgetall(rKeys.user(id));
  },

  findByRdioId: function* findByRdioId(rdioId) {
    var userId = yield redis.get(rKeys.rdioIdToUserId(rdioId));
    return userId ? (yield redis.hgetall(rKeys.user(userId))) : null;
  },

  updateRdioCreds: function* updateRdioCreds(id, token, secret) {
    yield redis.hmset(rKeys.user(id), { rdioToken: token, rdioSecret: secret });
  }
};

// dependencies
// ------------

// internal modules
_ = appRequire('utils/utils');
rKeys = appRequire('utils/redis').keys;
redis = appRequire('utils/redis').client;

// helper methods
// --------------

function userHashFromRdioData(userId, rdioJson, token, secret) {
  return {
    id: userId,
    firstName: rdioJson.firstName,
    rdioUserId: rdioJson.key,
    rdioToken: token,
    rdioSecret: secret
  };
}
