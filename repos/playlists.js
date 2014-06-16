var _, rdio, redis, scorer, Playlist, users;

// internal modules
_ = appRequire('utils/utils');
redis = appRequire('utils/redis');
rdio = appRequire('utils/rdio_client');
scorer = appRequire('utils/scorer');
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

  findById: function* findById(id) {
    var json, keys;

    keys = buildKeys(id);
    json = yield redis.hgetall(keys.base);

     return json ? new Playlist(json) : null;
  },

  sync: function* sync(user, id) {
    var fetchedTracks, json, keys, newTracks, purgeBlocks, staleTracks,
        storedTracks, zaddArgs;

    resp = yield rdio.getPlaylist(user, { playlist: id });

    if (resp.err) { throw new Error(resp.err); }

    keys = buildKeys(id);
    json = jsonFromRdioPlaylist(resp.result);
    fetchedTracks = tracksFromRdioPlaylist(resp.result);

    storedTracks = yield redis.zrangebyscore([keys.tracks, '-inf', '+inf']);
    staleTracks = yield redis.zrangebyscore([keys.tracks, '-inf', scorer.fresh]);
    newTracks = _.difference(fetchedTracks, storedTracks);

    // store new tracks with their score set to now
    if (newTracks.length) {
      zaddArgs = zaddArgsForTracks(keys.tracks, newTracks);
      yield redis.zadd(zaddArgs);
    }

    // remove stale tracks from rdio playlist
    if (staleTracks.length) {
      purgeBlocks = getPurgeBlocks(fetchedTracks, staleTracks);

      // these requests have to be executed in series in order to work around
      // the rdio api requirement that requires the count and index
      for (var block; block = purgeBlocks.shift();) {
        yield rdio.removeFromPlaylist(user, {
          playlist: playlistId,
          index: block.index,
          count: block.count,
          tracks: block.tracks
        });
      };
    }
  }
};

function buildKeys(id) {
  var base = _.format('playlists/%s', id);

  return {
    base: base,
    tracks: _.format('%s/tracks', base)
  };
}

function getPurgeBlocks(tracks, stale) {
    var block, blocks, isStale, track;

    blocks = [];
    for (var i = tracks.length; i >= 0; i--) {
      track = tracks[i];
      isStale =  _.contains(stale, track);

      // new block found or append to current block
      if (isStale) {
        block ? block.tracks.push(track) : (block = { tracks: [track] });
      }

      // end block if a non-stale track is found or if we're
      // at the end of the collection
      if (block && (!isStale || i === 0)) {
        block.index = i === 0 ? i : i + 1;
        block.count = block.tracks.length;

        blocks.push(block);
        block = null;
      }
    }

    return blocks;
}

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
  var score = scorer.now;

  return _.chain(tracks)
  .map(function(t) { return [score, t]; })
  .flatten()
  .unshift(key)
  .value();
}
