var _, User;

// internal modules
_ = appRequire('utils/utils');

User = function User(json) {
  json = json || {};

  this._json = json;
  this._dirty = false;
};

User.prototype = {
  get firstName() {
    return this._json.firstName;
  },

  get fullName() {
    return _.format('%s %s', this._json.firstName, this._json.lastName);
  },

  get id() {
    return this._json.id;
  },

  get oauth() {
    return { token: this._json.token, secret: this._json.secret };
  },

  get url() {
    return this._json.url;
  }
};

// export
module.exports = User;
