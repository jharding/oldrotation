var _, Notification;

// internal modules
_ = appRequire('utils/utils');

Notification = function Notification(json) {
  json = json || {};

  this._json = json;
  this._dirty = false;
};

Notification.prototype = {
  get id() {
    return this._json.id;
  },

  get target() {
    return this._json.target;
  },

  get title() {
    return this._json.title;
  },

  get permalink() {
    return _.format('/notifications/%d', this.id);
  },

  get json() {
    return _.clone(this._json);
  }
};

// export
module.exports = Notification;
