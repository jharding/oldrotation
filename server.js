var _ = require('koa-route');
var koa = require('koa');
var logger = require('koa-common').logger;
var session = require('koa-common').session;
var bodyparser = require('koa-bodyparser');

var usersController = require('./controllers/users.js');
var db = require('./utils/postgres.js');

db.configure({ user: 'push', database: 'push_dev' });

var app = koa();

app.keys = ['im a newer secret', 'i like turtle'];

app.use(session());
app.use(logger());
app.use(bodyparser());

app.use(_.get('/signup', usersController.signupPage));
app.use(_.post('/signup', usersController.signup));
app.use(_.get('/login', usersController.loginPage));
app.use(_.post('/login', usersController.login));

app.listen(3000);
console.log('listening on port 3000');
