var _, Rotation, userRepo, User;

// export
// ------

User = module.exports = function User(json) {
  json = json || {};

  this._json = json;
  this._dirty = false;
};

// dependencies
// ------------

// internal modules
_ = appRequire('utils/utils');
Rotation = appRequire('models/rotation');
userRepo = appRequire('repos/users');

// implementation
// --------------

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
      (json = yield userRepo.createFromRdio(rdioJson, token, secret));

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
  },

  rotation: function* rotation() {
    return yield Rotation.findByOwner(this);
  }
};
