var auth, compose, controller, mw, views;

// export
// ------

// needed for init
auth = appRequire('utils/auth');
compose = require('koa-compose');
mw = appRequire('utils/endpoint_mw');

controller = module.exports = {
  'get /auth/rdio': compose([
    mw.requireUnauth,
    auth.authenticate('rdio')
  ]),

  'get /auth/rdio/callback': compose([
    mw.requireUnauth,
    auth.authenticate('rdio'),
    mw.redirectTo('/')
  ]),

  'get /logout': compose([
    mw.logout,
    mw.redirectTo('/')
  ])
};
