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
var usersController = appRequire('controllers/users');
var db = appRequire('utils/postgres');

db.configure({ user: 'push', database: 'push_dev' });

var app = koa();

app.keys = ['im a newer secret', 'i like turtle'];

app.use(logger());
app.use(bodyparser());
app.use(session());
app.use(auth.initialize());
app.use(csrf.protect(app));

app.use(_.get('/signup', usersController.showSignup));
app.use(_.post('/signup', usersController.signup));
app.use(_.get('/login', usersController.showLogin));
app.use(_.post('/login', usersController.login));
app.use(_.get('/logout', usersController.logout));
app.use(_.get('/account', usersController.showLoggedInUser));
app.use(_.get('/', usersController.showLoggedInUser));

app.listen(3000);
console.log('listening on port 3000');
