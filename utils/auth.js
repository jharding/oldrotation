var _, auth, co, compose, LocalStrategy, passport, userRepo;

// external modules
_ = require('underscore');
co = require('co');
compose = require('koa-compose');
LocalStrategy = require('passport-local').Strategy;
passport = require('koa-passport');

// internal modules
userRepo = appRequire('models/users');

passport.serializeUser(co(serializeUser));
passport.deserializeUser(co(deserializeUser));
passport.use(new LocalStrategy({ usernameField: 'email' }, co(verify)));

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

function* verify(email, password) {
    var validCreds;

    validCreds = yield userRepo.verifyCredentials(email, password);
    return validCreds ? yield userRepo.findByEmail(email) : null;
}
