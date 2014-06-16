var _ = require('koa-route');
var koa = require('koa');
var logger = require('koa-common').logger;
var session = require('koa-common').session;
var bodyparser = require('koa-bodyparser');
var thunkify = require('thunkify');
var compose = require('koa-compose');

require('./utils/app_require.js')(__dirname); // add appRequire to global namespace
var auth = appRequire('utils/auth');
var csrf = appRequire('utils/csrf');
var viewCtx = appRequire('utils/view_ctx');
var users = appRequire('controllers/users');
var playlists = appRequire('controllers/playlists');
var cronSync = appRequire('cron/sync');

var app = koa();

app.keys = ['im a newer secret', 'i like turtle'];

app.use(logger());
app.use(bodyparser());
app.use(session());
app.use(auth.initialize());
app.use(csrf.protect(app));
app.use(viewCtx);

cronSync.start();

app.use(_.get('/', users.showLoggedInUser));
app.use(_.get('/auth/rdio', users.getRequestToken));
app.use(_.get('/auth/rdio/callback', users.getAccessToken));
app.use(_.get('/logout', users.logout));
app.use(_.get('/setup', playlists.setup));
app.use(_.post('/playlists', playlists.create));
app.use(_.get('/playlists/:id/sync', playlists.sync));

app.listen(process.env.PORT || 5000);
console.log('listening on port 3000');
