var app, auth, bodyparser, csrf, koa, logger, rotations, routeManager, session,
    thunkify, users, viewCtx;

// must go before all other requires
if (process.env.NODETIME_ACCOUNT_KEY) {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'Rotation'
  });
}

// external modules
bodyparser = require('koa-bodyparser');
koa = require('koa');
logger = require('koa-common').logger;
session = require('koa-common').session;
thunkify = require('thunkify');

// add appRequire to global namespace
require('./utils/app_require.js')(__dirname);

// internal modules
auth = appRequire('utils/auth');
csrf = appRequire('utils/csrf');
rotations = appRequire('controllers/rotations');
routeManager = appRequire('utils/route_manager');
users = appRequire('controllers/users');
viewCtx = appRequire('utils/view_ctx');

app = koa();
app.keys = ['dTmka*uIwd$BfN8', 'Ue0kDaU$l!8zAEF', 'Q7zC70PK%Bm@%By'];

if (app.env === 'development') {
  app.use(logger());
}

// register middleware that should be applied for every request
app.use(bodyparser());
app.use(session());
app.use(auth.initialize());
app.use(csrf.protect(app));
app.use(viewCtx);

// register controllers
routeManager(app, users);
routeManager(app, rotations);

// TODO: remove this shit
var route = require('koa-route');
app.use(route.get('/rotations/force_sync', function* () {
  var rotation = yield this.user.rotation();
  this.body = yield rotation.sync();
}));

app.listen(process.env.PORT || 3000);
console.log('listening on port ' + (process.env.PORT || 3000));
