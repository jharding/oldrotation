var render, views;

// internal modules
render = appRequire('utils/render');

// export
views = module.exports = {
  loginForm: function* loginForm() {
    return yield render('templates/login', {
      csrfParam: this.csrfParam,
      csrfToken: this.csrf,
    });
  },

  signupForm: function* signupForm() {
    return yield render('templates/signup', {
      csrfParam: this.csrfParam,
      csrfToken: this.csrf
    });
  }
};
