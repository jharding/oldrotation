var _, secondsSinceEpoch, rdio, redis, Playlist, users;

// internal modules
_ = appRequire('utils/utils');
secondsSinceEpoch = appRequire('utils/seconds_since_epoch');
redis = appRequire('utils/redis');
rdio = appRequire('utils/rdio_client');
Playlist = appRequire('models/playlist');

playlists = module.exports = {
  create: function* create(user, name, description) {
    var json, resp, tracks, zaddArgs;

    resp = yield rdio.createPlaylist(user, {
      name: name,
      description: description
    });

    if (resp.err) { throw new Error(resp.err); }

    json = jsonFromRdioPlaylist(resp.result);
    tracks = tracksFromRdioPlaylist(resp.result);
    keys = buildKeys(json.id);

    yield redis.hmset(keys.base, json);

    if (tracks.length) {
      zaddArgs = zaddArgsForTracks(keys.tracks, tracks);
      yield redis.zadd(zaddArgs);
    }

    return json ? new Playlist(json) : null;
  },

  findById: function* refresh(id) {
    var json, keys;

    keys = buildKeys(id);
    json = yield redis.hgetall(keys.base);

     return json ? new Playlist(json) : null;
  },

  sync: function* sync(user, id) {
    var fetchedTracks, json, newTracks, oldTracks, resp, zaddArgs;

    resp = yield rdio.getPlaylist(user, { playlist: id });

    if (resp.err) { throw new Error(resp.err); }

    json = jsonFromRdioPlaylist(resp.result);
    fetchedTracks = tracksFromRdioPlaylist(resp.result);
    keys = buildKeys(json.id);

    oldTracks = yield redis.zrangebyscore([keys.tracks, '-inf', '+inf']);
    newTracks = _.difference(fetchedTracks, oldTracks);

    if (newTracks.length) {
      zaddArgs = zaddArgsForTracks(keys.tracks, newTracks);
      yield redis.zadd(zaddArgs);
    }

    return newTracks;
  }
};

function jsonFromRdioPlaylist(rdio) {
  return {
    id: rdio.key,
    owner: rdio.ownerKey,
    name: rdio.name,
    url: rdio.url,
    icon: rdio.icon
  };
}

function tracksFromRdioPlaylist(rdio) {
  return rdio.trackKeys || [];
}

function zaddArgsForTracks(key, tracks) {
  var score = secondsSinceEpoch();

  return _.chain(tracks)
  .map(function(t) { return [score, t]; })
  .flatten()
  .unshift(key)
  .value();
}

function buildKeys(id) {
  var base = _.format('playlists/%s', id);

  return {
    base: base,
    tracks: _.format('%s/tracks', base)
  };
}
