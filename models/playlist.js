var _, Playlist;

// internal modules
_ = appRequire('utils/utils');

Playlist = function Playlist(json) {
  json = json || {};

  this._json = json;
  this._dirty = false;
};

Playlist.prototype = {
  get id() {
    return this._json.id;
  },

  get name() {
    return this._json.name;
  },

  get owner() {
    return this._json.owner;
  },

  get url() {
    return this._json.url;
  }
};

// export
module.exports = Playlist;
