var render, views;

// internal modules
render = appRequire('utils/render');

// export
views = module.exports = {
  signupForm: function* signupForm() {
    return yield render('templates/user/signup', this.viewCtx());
  },

  loginForm: function* loginForm() {
    return yield render('templates/user/login', this.viewCtx());
  },

  settings: function* settings(account) {
    return yield render('templates/user/settings', this.viewCtx({
      account: account
    }));
  }
};
