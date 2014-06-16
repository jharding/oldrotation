var _, auth, co, compose, config, passport, rdioConfig, RdioStrategy, User;

// external modules
_ = require('underscore');
co = require('co');
compose = require('koa-compose');
RdioStrategy = require('passport-rdio').Strategy;
passport = require('koa-passport');

// internal modules
config = appRequire('utils/config');
User = appRequire('models/user');

passport.serializeUser(co(serializeUser));
passport.deserializeUser(co(deserializeUser));

rdioConfig = {
  consumerKey: config.rdio.consumerKey,
  consumerSecret: config.rdio.consumerSecret,
  callbackURL: _.format('%s/auth/rdio/callback', config.app.url)
};

passport.use(new RdioStrategy(rdioConfig, co(verify)));

// export
auth = module.exports = {
  initialize: function initialize() {
    return compose([
      passport.initialize(),
      passport.session(),
      addHelpersToCtx()
    ]);
  },

  authenticate: passport.authenticate.bind(passport)
};

function addHelpersToCtx(o) {
  var name = (o && o.name) || 'user';

  return addHelpersToCtx;

  function* addHelpersToCtx(next) {
    this[name] = this.req.user;
    yield next;
  }
}

function* serializeUser(user) {
  return user.id;
}

function* deserializeUser(id) {
  return yield User.findById(id);
}

function* verify(token, secret, profile) {
  var rdioJson = profile._json.result;
  return yield User.rdioFindOrCreate(rdioJson, token, secret);
}
