var render, views;

// internal modules
render = appRequire('utils/render');

// export
views = module.exports = {
  setup: function* setup() {
    return yield render('templates/playlists/setup', this.viewCtx());
  }
};
