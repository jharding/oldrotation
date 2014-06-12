var _ = require('underscore'),
    co = require('co'),
    compose = require('koa-compose'),
    LocalStrategy = require('passport-local').Strategy,
    passport = require('koa-passport');

var users = require('../models/users.js');

passport.serializeUser(co(serializeUser));
passport.deserializeUser(co(deserializeUser));
passport.use(new LocalStrategy({ usernameField: 'email' }, co(verify)));

module.exports = {
  initialize: initialize,
  auth: passport.authenticate.bind(passport)
};

function initialize() {
  return compose([
    passport.initialize(),
    passport.session(),
    addUserToCtx()
  ]);
}

function addUserToCtx(o) {
  var name = (o && o.name) || 'user';

  return addUserToCtx;

  function* addUserToCtx(next) {
    this[name] = this.req.user;
    yield next;
  }
}

function* serializeUser(user) {
  return user.id;
}

function* deserializeUser(id) {
  return yield users.findById(id);
}

function* verify(email, password) {
    var validCreds;

    validCreds = yield users.verifyCredentials(email, password);
    return validCreds ? yield users.findByEmail(email) : null;
}
