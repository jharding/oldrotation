var _, User;

// internal modules
_ = appRequire('utils/utils');

User = function User(json) {
  json = json || {};

  // strip password from raw data
  delete json.password;

  this._json = json;
  this._dirty = false;
};

User.prototype = {
  get email() {
    return this._json.email;
  },

  set email(email) {
    this._dirty = email !== this._json.email;
    this._json.email = email;
  },

  get id() {
    return this._json.id;
  },

  get json() {
    return _.clone(this._json);
  }
};

// export
module.exports = User;
