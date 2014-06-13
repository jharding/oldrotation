var render, views;

// internal modules
render = appRequire('utils/render');

// export
views = module.exports = {
  newForm: function* newForm() {
    return yield render('templates/notifications/new', {
      csrfParam: this.csrfParam,
      csrfToken: this.csrf,
      user: this.user
    });
  }
};
