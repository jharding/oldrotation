var _, auth, co, compose, creds, passport, rdioConfig, RdioStrategy, userRepo;

// external modules
_ = require('underscore');
co = require('co');
compose = require('koa-compose');
RdioStrategy = require('passport-rdio').Strategy;
passport = require('koa-passport');

// internal modules
creds = appRequire('utils/creds');
userRepo = appRequire('repos/users');

passport.serializeUser(co(serializeUser));
passport.deserializeUser(co(deserializeUser));

rdioConfig = {
  consumerKey: creds.rdio.consumerKey,
  consumerSecret: creds.rdio.consumerSecret,
  callbackURL: 'http://127.0.0.1:3000/auth/rdio/callback'
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
  return yield userRepo.findById(id);
}

function* verify(token, secret, profile) {
  return yield userRepo.refresh(profile._json.result, token, secret);
}
