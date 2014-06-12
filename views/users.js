var render, views;

// internal modules
render = appRequire('utils/render');

// export
views = module.exports = {
  loginForm: function* loginForm() {
    return yield render('templates/user/login', {
      csrfParam: this.csrfParam,
      csrfToken: this.csrf,
    });
  },

  signupForm: function* signupForm() {
    return yield render('templates/user/signup', {
      csrfParam: this.csrfParam,
      csrfToken: this.csrf
    });
  }
};
