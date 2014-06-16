var co, intervalId, INTERVAL_IN_MS, playlistRepo, userRepo;

// external modules
co = require('co');

// internal modules
playlistRepo = appRequire('repos/playlists');
userRepo = appRequire('repos/users');

// constants
INTERVAL_IN_MS = 1 * 1000 * 60 * 60 * 24; // 1 day

// exports
module.exports = {
  start: function start() {
    co(syncPlaylists)();
  },

  stop: function stop() {
    intervalId && clearInterval(intervalId);
  }
};

function* syncPlaylists() {
  var id, ids;

  ids = yield playlistRepo.allIds();
  console.log(ids)
  while (id = ids.shift()) {
    yield syncPlaylist(id);
  }
}

function* syncPlaylist(id) {
  var owner, playlist;

  playlist = yield playlistRepo.findById(id);
  owner = playlist ? yield userRepo.findById(playlist.owner) : null;

  if (playlist && owner) {
    yield playlistRepo.sync(owner, playlist.id);
    console.log('synced playlist with id %s', id);
  }

  else {
    console.log('unable to sync playlist with id %s', id);
  }
}
