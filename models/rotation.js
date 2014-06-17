var _, Rotation, rotationRepo, User;

// export
// ------

Rotation = module.exports = function Rotation(json, owner) {
  json = json || {};

  this._json = json;
  this._dirty = false;

  this._owner = _.isUser(owner) ? owner : null;
  this._ownerId = _.isUser(owner) ? owner.id : owner;
};

// dependencies
// ------------

// internal modules
_ = appRequire('utils/utils');
rotationRepo = appRequire('repos/rotations');
User = appRequire('models/user');

// implementation
// --------------

// class methods
_.extend(Rotation, {
  create: function* create(user, name, description) {
    var json = yield rotationRepo.create(user, name, description);
    return json ? new Rotation(json, user) : null;
  },

  findByOwner: function* findByOwner(owner) {
    var json = yield rotationRepo.findByOwnerId(owner.id);
    return json ? new Rotation(json, owner) : null;
  },

  findByOwnerId: function* findByOwnerId(ownerId) {
    var json = yield rotationRepo.findByOwnerId(ownerId);
    return json ? new Rotation(json, ownerId) : null;
  }
});

// instance methods
Rotation.prototype = {
  get description() {
    return this._json.description;
  },

  get name() {
    return this._json.name;
  },

  get rdioId() {
    return this._json.rdioId;
  },

  owner: function* owner() {
    this._owner = this._owner || (yield User.findById(this._ownerId));
    return this._owner;
  },

  sync: function* sync() {
    var owner = yield this.owner();
    return yield rotationRepo.sync(owner, this.rdioId);
  },

  tracks: function* tracks() {
    var owner = yield this.owner();
    return yield rotationRepo.getTracksByOwnerId(owner.id);
  }
};
