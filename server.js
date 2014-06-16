var app, auth, bodyparser, cronSync, csrf, koa, logger, playlists,
    routeManager, session, thunkify, users, viewCtx;

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
cronSync = appRequire('cron/sync');
csrf = appRequire('utils/csrf');
playlists = appRequire('controllers/playlists');
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

// periodically syncs playlists
cronSync.start();

// register controllers
routeManager(app, users);
routeManager(app, playlists);

// TODO: remove this shit
var route = require('koa-route');
app.use(route.get('/playlists/force_sync', function* () {
  cronSync.force();
}));

app.listen(process.env.PORT || 3000);
console.log('listening on port ' + (process.env.PORT || 3000));
