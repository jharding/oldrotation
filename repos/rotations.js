var _, rdio, rKeys, redis, rotationRepo, scorer, users;

// export
// ------

rotationRepo = module.exports = {
  findByOwnerId: function* findByOwnerId(ownerId) {
    var results;

    results = yield [
      redis.hgetall(rKeys.rotationMetadata(ownerId)),
      redis.zrangebyscore([rKeys.rotationTracks(ownerId), '-inf', '+inf'])
    ];

    return results[0] ? { metadata: results[0], tracks: results[1] } : null;
  },

  create: function* create(user, name, description) {
    var hash, rdioResp, success;

    rdioResp = yield rdio.createPlaylist(user, {
      name: name,
      description: description
    });

    if (rdioResp.err) { throw new Error(rdioResp.err); }

    hash = metadataHashFromRdioPlaylist(rdioResp.result);
    success = yield redis.hmset(rKeys.rotationMetadata(user.id), hash);

    return success ? hash : null;
  },

  link: function* link(user, playlistId) {
    // TODO
  },

  sync: function* sync(user, rotationId) {
    var fetchedTracks, hash, newTracks, purgeBlocks, rdioResp, removedTracks,
        staleTracks, storedTracks, trackKey, zaddArgs;

    rdioResp = yield rdio.getPlaylist(user, { playlist: rotationId });

    if (rdioResp.err) { throw new Error(rdioResp.err); }

    hash = metadataHashFromRdioPlaylist(rdioResp.result);
    fetchedTracks = tracksFromRdioPlaylist(rdioResp.result);

    tracksKey = rKeys.rotationTracks(user.id);
    storedTracks = yield redis.zrangebyscore([tracksKey, '-inf', '+inf']);
    staleTracks = yield redis.zrangebyscore([tracksKey, '-inf', scorer.fresh]);
    newTracks = _.difference(fetchedTracks, storedTracks);
    removedTracks = _.difference(storedTracks, fetchedTracks);

    // remove tracks that have been manually removed since last sync
    if (removedTracks.length) {
      var a = yield redis.zrem([tracksKey].concat(removedTracks));
    }

    // store new tracks with their score set to now
    if (newTracks.length) {
      zaddArgs = zaddArgsForTracks(tracksKey, newTracks);
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

    return {
      newTracks: newTracks,
      removedTracks: removedTracks,
      staleTracks: staleTracks
    };
  }
};

// dependencies
// ------------

// internal modules
_ = appRequire('utils/utils');
rKeys = appRequire('utils/redis').keys;
redis = appRequire('utils/redis').client;
rdio = appRequire('utils/rdio_client');
scorer = appRequire('utils/scorer');

// helper methods
// --------------

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

function metadataHashFromRdioPlaylist(rdioPlaylist) {
  return {
    rdioId: rdioPlaylist.key,
    name: rdioPlaylist.name,
    description: rdioPlaylist.description
  };
}

function tracksFromRdioPlaylist(rdioPlaylist) {
  return rdioPlaylist.trackKeys || [];
}

function zaddArgsForTracks(key, tracks) {
  var score = scorer.now;

  return _.chain(tracks)
  .map(function(t) { return [score, t]; })
  .flatten()
  .unshift(key)
  .value();
}
