var auth, authenticate, compose, controller, mw, userRepo, views;

// external modules
compose = require('koa-compose');

// internal modules
auth = appRequire('utils/auth');
mw = appRequire('utils/endpoint_mw');
userRepo = appRequire('repos/users');
views = appRequire('views/users');

authenticate = auth.authenticate('local');

// export
controller = module.exports = {
  showSignup: compose([
    mw.requireUnauth,
    showSignup
  ]),

  showLogin: compose([
    mw.requireUnauth,
    showLogin
  ]),

  showUser: function* showUser() {
    this.body = this.user;
  },

  signup: compose([
    mw.requireUnauth,
    signup
  ]),

  login: compose([
    mw.requireUnauth,
    authenticate,
    redirectAfterLogin
  ]),

  logout: compose([
    mw.logout,
    mw.redirectTo('/login')
  ])
};

function* showSignup() {
  this.body = yield views.signupForm.call(this);
}

function* showLogin() {
  this.body = yield views.loginForm.call(this);
}

function* signup() {
  var email, password;

  email = this.request.body.email;
  password = this.request.body.password;

  if (yield userRepo.isEmailTaken(email)) {
    this.throw(422, 'email is already associated with an account');
  }

  yield userRepo.create(email, password);

  // signup was successful, so let's log them in
  return yield controller.login.call(this);
}

function* redirectAfterLogin() {
  this.redirect(this.request.body.redirect_to || '/');
}
