var compose, controller, mw, Rotation, views;

// export
// ------

// modules needed for init
compose = require('koa-compose');
mw = appRequire('utils/endpoint_mw');

controller = module.exports = {
  'post /playlists': compose([
    mw.requireAuth,
    createPlaylists
  ]),

 'get /playlists/new': compose([
    mw.requireAuth,
    renderSetup
  ]),

 'get /rotation': compose([
    mw.requireAuth,
    function*() {
      this.body = yield Rotation.findByOwner(this.user);
    }
  ]),

 'get /playlists/:id/sync': compose([
    mw.requireAuth,
    syncPlaylist
  ])
};

// dependencies
// ------------

// internal modules
Rotation = appRequire('models/rotation');
views = appRequire('views/playlists');

// implementation
// --------------

function* createPlaylists() {
  var name, description;

  name = this.request.body.name;
  description = this.request.body.description;

  yield Rotation.create(this.user, name, description);
  this.redirect('/rotation');
}

function* renderSetup() {
  this.body = yield views.setup.call(this);
}

function* syncPlaylist(id) {
  var rotation = yield Rotation.findByOwner(this.user);
  yield rotation.sync();
}
