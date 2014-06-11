var jade = require('jade'),
    thunkify = require('thunkify');

var users = require('../models/users.js');

module.exports = {
  loginPage: loginPage,
  signupPage: signupPage,
  login: login,
  signup: signup,

};

function* loginPage() {
  var render = thunkify(jade.renderFile);
  this.body = yield render('templates/login.jade', null);
}

function* signupPage() {
  var render = thunkify(jade.renderFile);
  this.body = yield render('templates/signup.jade', null);
}

function* login() {
  var email, password;

  email = this.request.body.email;
  password = this.request.body.password;

  this.body = yield users.verifyCredentials(email, password);
}

function* signup() {
  var email, password;

  email = this.request.body.email;
  password = this.request.body.password;

  if (yield users.isEmailTaken(email)) {
    this.throw(422, 'email is already associated with an account');
  }

  this.body = yield users.createUser(email, password);
}
