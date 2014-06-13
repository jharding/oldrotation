var render, views;

// internal modules
render = appRequire('utils/render');

// export
views = module.exports = {
  signupForm: function* signupForm() {
    return yield render('templates/users/signup', this.viewCtx());
  },

  loginForm: function* loginForm() {
    return yield render('templates/users/login', this.viewCtx());
  },

  settings: function* settings(account) {
    return yield render('templates/users/settings', this.viewCtx({
      account: account
    }));
  }
};
