var auth, authorize, compose, controller, mw, views;

// external modules
compose = require('koa-compose');

// internal modules
auth = appRequire('utils/auth');
mw = appRequire('utils/endpoint_mw');
views = appRequire('views/users');

authorize = auth.authenticate('rdio');

// export
controller = module.exports = {
  getRequestToken: compose([
    mw.requireUnauth,
    authorize
  ]),

  getAccessToken: compose([
    mw.requireUnauth,
    authorize,
    mw.redirectTo('/')
  ]),

  logout: compose([
    mw.logout,
    mw.redirectTo('/')
  ]),

  showLoggedInUser: compose([
    mw.requireAuth,
    showLoggedInUser
  ]),
};

function* showLoggedInUser() {
  this.body = yield views.settings.call(this, this.user);
}
