var render, views;

// internal modules
render = appRequire('utils/render');

// export
views = module.exports = {
  signupForm: function* signupForm() {
    return yield render('templates/user/signup', {
      csrfParam: this.csrfParam,
      csrfToken: this.csrf,
      user: this.user
    });
  },

  loginForm: function* loginForm() {
    return yield render('templates/user/login', {
      csrfParam: this.csrfParam,
      csrfToken: this.csrf,
      user: this.user
    });
  },

  settings: function* settings(account) {
    return yield render('templates/user/settings', {
      account: account,
      csrfParam: this.csrfParam,
      csrfToken: this.csrf,
      user: this.user
    });
  }
};
