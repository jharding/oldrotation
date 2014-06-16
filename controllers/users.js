var auth, authorize, compose, controller, mw, routes, views;

// external modules
compose = require('koa-compose');

// internal modules
auth = appRequire('utils/auth');
mw = appRequire('utils/endpoint_mw');
views = appRequire('views/users');

authorize = auth.authenticate('rdio');

routes = {
  'get /auth/rdio': 'getRequestToken',
  'get /auth/rdio/callback': 'storeAccessToken',
  'get /logout': 'logout'
};

// export
controller = module.exports = {
  get routes() {
    return routes;
  },

  getRequestToken: compose([
    mw.requireUnauth,
    authorize
  ]),

  storeAccessToken: compose([
    mw.requireUnauth,
    authorize,
    mw.redirectTo('/')
  ]),

  logout: compose([
    mw.logout,
    mw.redirectTo('/')
  ])
};
