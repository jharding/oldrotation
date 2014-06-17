var _, rdio, rKeys, redis, rotationRepo, scorer, users;

// export
// ------

rotationRepo = module.exports = {
  findByOwnerId: function* findByOwnerId(ownerId) {
    return yield redis.hgetall(rKeys.rotationMetadata(ownerId));
  },

  getTracksByOwnerId: function* getTracksByOwnerId(ownerId) {
    var rKey, result, trackIds, tracks;

    rKey = rKeys.rotationTracks(ownerId);
    result = yield redis.zrangebyscore([rKey, '-inf', '+inf', 'WITHSCORES']);

    for (var i = 0, trackIds = []; i < result.length; i += 2) {
      trackIds.unshift(result[i]);
    }

    trackRKeys = _.map(trackIds, rKeys.track);
    tracks = yield redis.mget(trackRKeys);
    tracks = _.map(tracks, JSON.parse);

    return _.object(trackIds, tracks);
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
    var rdioResp, hash, fetchedTracks, fetchedKeys, tracksRKey, storedKeys,
        staleKeys, newKeys, removedKeys, zaddArgs, purgeBlocks;


    rdioResp = yield rdio.getPlaylist(user, { playlist: rotationId });

    if (rdioResp.err) { throw new Error(rdioResp.err); }

    hash = metadataHashFromRdioPlaylist(rdioResp.result);
    fetchedTracks = rdioResp.result.tracks;
    fetchedKeys = _.pluck(fetchedTracks, 'key');

    // store the data for the fetched tracks, but do it offline
    storeTracks(fetchedTracks);

    tracksRKey = rKeys.rotationTracks(user.id);
    storedKeys = yield redis.zrangebyscore([tracksRKey, '-inf', '+inf']);
    staleKeys = yield redis.zrangebyscore([tracksRKey, '-inf', scorer.fresh]);
    newKeys = _.difference(fetchedKeys, storedKeys);
    removedKeys = _.difference(storedKeys, fetchedKeys);

    // remove tracks that have been manually removed since last sync
    if (removedKeys.length) {
      yield redis.zrem([tracksRKey].concat(removedKeys));
    }

    // store new tracks with their score set to now
    if (newKeys.length) {
      zaddArgs = zaddArgsForTrackKeys(tracksRKey, newKeys);
      yield redis.zadd(zaddArgs);
    }

    // remove stale tracks from rdio playlist
    if (staleKeys.length) {
      purgeBlocks = getPurgeBlocks(fetchedKeys, staleKeys);

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
      newTracks: newKeys,
      removedTracks: removedKeys,
      staleTracks: staleKeys
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

function storeTracks(tracks) {
  var args;

  if (!tracks || !tracks.length) {
    return;
  }

  args = _.chain(tracks)
  .map(function(v) { return [rKeys.track(v.key), JSON.stringify(v)]; })
  .flatten()
  .value()

  console.log('storing tracks');
  redis.mset(args)(function() {
    console.log(arguments);
  });
}

function zaddArgsForTrackKeys(key, tracks) {
  var score = scorer.now;

  return _.chain(tracks)
  .map(function(t) { return [score, t]; })
  .flatten()
  .unshift(key)
  .value();
}
