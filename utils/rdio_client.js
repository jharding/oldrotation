var _, creds, rdio, RDIO_API_URL, request;

// internal modules

// internal modules
_ = appRequire('utils/utils');
creds = appRequire('utils/creds');
request = appRequire('utils/request');

// constants
RDIO_API_URL = 'http://api.rdio.com/1/';

// exports
rdio = module.exports = {
  createPlaylist: function* createPlaylist(user, o) {
    o = _.chain(o || {})
    .pick('name', 'description', 'tracks')
    .extend({ method: 'createPlaylist', extras: 'trackKeys' })
    .value();

    o.tracks = _.isArray(o.tracks) ? o.tracks.join(',') : o.tracks;

    return yield post(user, o);
  },

  getPlaylist: function* getPlaylist(user, o) {
    o = _.chain(o || {})
    .pick('playlist')
    .extend({ method: 'addToPlaylist', tracks: '', extras: 'trackKeys' })
    .value();

    return yield post(user, o);
  },

  removeFromPlaylist: function* getPlaylist(user, o) {
    o = _.chain(o || {})
    .pick('playlist', 'index', 'count', 'tracks')
    .extend({ method: 'removeFromPlaylist', extras: 'trackKeys' })
    .value();

    o.tracks = _.isArray(o.tracks) ? o.tracks.join(',') : o.tracks;

    return yield post(user, o);
  }
}

function* post(user, params) {
  var body, result;

  result = yield request.post({
    url: RDIO_API_URL,
    form: params,
    oauth: oauth(user)
  });

  body = JSON.parse(result[1]);
  return { err: body.message, result: body.result };
}

function oauth(user) {
  return {
    consumer_key: creds.rdio.consumerKey,
    consumer_secret: creds.rdio.consumerSecret,
    token: user.oauth.token,
    token_secret: user.oauth.secret
  };
}
