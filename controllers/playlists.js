var compose, controller, mw, playlistRepo, routes, views;

// external modules
compose = require('koa-compose');

// internal modules
mw = appRequire('utils/endpoint_mw');
playlistRepo = appRequire('repos/playlists');
views = appRequire('views/playlists');

routes = {
  'get /playlists/new': 'setup',
  'post /playlists': 'create',
  'get /playlists/:id/sync': 'sync'
};

// export
controller = module.exports = {
  get routes() {
    return routes;
  },

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
