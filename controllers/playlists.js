var compose, controller, mw, playlistRepo, views;

// external modules
compose = require('koa-compose');

// internal modules
mw = appRequire('utils/endpoint_mw');
playlistRepo = appRequire('repos/playlists');
views = appRequire('views/playlists');

// export
controller = module.exports = {
  create: compose([
    mw.requireAuth,
    createPlaylists
  ]),

 setup: compose([
    mw.requireAuth,
    renderSetup
  ]),

 sync: compose([
    mw.requireAuth,
    syncPlaylist
  ])
};

function* createPlaylists() {
  var name, description;

  name = this.request.body.name;
  description = this.request.body.description;

  this.body = yield playlistRepo.create(this.user, name, description);
}

function* renderSetup() {
  this.body = yield views.setup.call(this);
}

function* syncPlaylist(id) {
  this.body = yield playlistRepo.sync(this.user, id);
}
