var _, userRepo, User;

// internal modules
_ = appRequire('utils/utils');
userRepo = appRequire('repos/users');

User = function User(json) {
  json = json || {};

  this._json = json;
  this._dirty = false;
};

// class methods
_.extend(User, {
  findById: function* findById(id) {
    var json = yield userRepo.findById(id);
    return json ? new User(json) : null;
  },

  findByRdioId: function* findByRdioId(id) {
    var json = yield userRepo.findByRdioId(id);
    return json ? new User(json) : null;
  },

  rdioFindOrCreate: function* rdioFindOrCreate(rdioJson, token, secret) {
    var json;

    // if the user exists, update thier rdio creds
    // otherwise create a new user
    (json = yield User.findByRdioId(rdioJson.key)) ?
      (yield userRepo.updateRdioCreds(json.id, token, secret)) :
      (json = yield userRepo.createFromRdioData(rdioJson, token, secret));

    return json ? new User(json) : null;
  }
});

// instance methods
User.prototype = {
  get firstName() {
    return this._json.firstName;
  },

  get id() {
    return this._json.id;
  },

  get oauth() {
    return { token: this._json.rdioToken, secret: this._json.rdioSecret };
  }
};

// export
module.exports = User;
